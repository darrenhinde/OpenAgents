#!/usr/bin/env bash

#############################################################################
# OpenCode Agents Installer
# Interactive installer for OpenCode agents, commands, tools, and plugins
#
# Compatible with:
# - macOS (bash 3.2+)
# - Linux (bash 3.2+)
# - Windows (Git Bash, WSL)
#############################################################################

set -e

# Detect platform
PLATFORM="$(uname -s)"
case "$PLATFORM" in
    Linux*)     PLATFORM="Linux";;
    Darwin*)    PLATFORM="macOS";;
    CYGWIN*|MINGW*|MSYS*) PLATFORM="Windows";;
    *)          PLATFORM="Unknown";;
esac

# Colors for output (disable on Windows if not supported)
if [ "$PLATFORM" = "Windows" ] && [ -z "$WT_SESSION" ] && [ -z "$ConEmuPID" ]; then
    # Basic Windows terminal without color support
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    MAGENTA=''
    CYAN=''
    BOLD=''
    NC=''
else
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    MAGENTA='\033[0;35m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m' # No Color
fi

# Configuration
REPO_URL="https://github.com/darrenhinde/opencode-agents"
BRANCH="${OPENCODE_BRANCH:-main}"  # Allow override via environment variable
RAW_URL="https://raw.githubusercontent.com/darrenhinde/opencode-agents/${BRANCH}"
REGISTRY_URL="${RAW_URL}/registry.json"
INSTALL_DIR=".opencode"
TEMP_DIR="/tmp/opencode-installer-$$"

# Global variables
SELECTED_COMPONENTS=()
INSTALL_MODE=""
PROFILE=""
NON_INTERACTIVE=false

#############################################################################
# Utility Functions
#############################################################################

print_header() {
    echo -e "${CYAN}${BOLD}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                                                                ║"
    echo "║           OpenCode Agents Installer v1.0.0                    ║"
    echo "║                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_step() {
    echo -e "\n${MAGENTA}${BOLD}▶${NC} $1\n"
}

#############################################################################
# Dependency Checks
#############################################################################

check_bash_version() {
    # Check bash version (need 3.2+)
    local bash_version="${BASH_VERSION%%.*}"
    if [ "$bash_version" -lt 3 ]; then
        echo "Error: This script requires Bash 3.2 or higher"
        echo "Current version: $BASH_VERSION"
        echo ""
        echo "Please upgrade bash or use a different shell:"
        echo "  macOS:   brew install bash"
        echo "  Linux:   Use your package manager to update bash"
        echo "  Windows: Use Git Bash or WSL"
        exit 1
    fi
}

check_dependencies() {
    print_step "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        echo ""
        echo "Please install them:"
        case "$PLATFORM" in
            macOS)
                echo "  brew install ${missing_deps[*]}"
                ;;
            Linux)
                echo "  Ubuntu/Debian: sudo apt-get install ${missing_deps[*]}"
                echo "  Fedora/RHEL:   sudo dnf install ${missing_deps[*]}"
                echo "  Arch:          sudo pacman -S ${missing_deps[*]}"
                ;;
            Windows)
                echo "  Git Bash: Install via https://git-scm.com/"
                echo "  WSL:      sudo apt-get install ${missing_deps[*]}"
                echo "  Scoop:    scoop install ${missing_deps[*]}"
                ;;
            *)
                echo "  Use your package manager to install: ${missing_deps[*]}"
                ;;
        esac
        exit 1
    fi
    
    print_success "All dependencies found"
}

#############################################################################
# Registry Functions
#############################################################################

fetch_registry() {
    print_step "Fetching component registry..."
    
    mkdir -p "$TEMP_DIR"
    
    if ! curl -fsSL "$REGISTRY_URL" -o "$TEMP_DIR/registry.json"; then
        print_error "Failed to fetch registry from $REGISTRY_URL"
        exit 1
    fi
    
    print_success "Registry fetched successfully"
}

get_profile_components() {
    local profile=$1
    jq -r ".profiles.${profile}.components[]" "$TEMP_DIR/registry.json"
}

get_component_info() {
    local component_id=$1
    local component_type=$2
    
    jq -r ".components.${component_type}[] | select(.id == \"${component_id}\")" "$TEMP_DIR/registry.json"
}

# Helper function to get the correct registry key for a component type
get_registry_key() {
    local type=$1
    # Most types are pluralized, but 'config' stays singular
    case "$type" in
        config) echo "config" ;;
        *) echo "${type}s" ;;
    esac
}

resolve_dependencies() {
    local component=$1
    local type="${component%%:*}"
    local id="${component##*:}"
    
    # Get the correct registry key (handles singular/plural)
    local registry_key=$(get_registry_key "$type")
    
    # Get dependencies for this component
    local deps=$(jq -r ".components.${registry_key}[] | select(.id == \"${id}\") | .dependencies[]?" "$TEMP_DIR/registry.json" 2>/dev/null || echo "")
    
    if [ -n "$deps" ]; then
        for dep in $deps; do
            # Add dependency if not already in list
            if [[ ! " ${SELECTED_COMPONENTS[@]} " =~ " ${dep} " ]]; then
                SELECTED_COMPONENTS+=("$dep")
                # Recursively resolve dependencies
                resolve_dependencies "$dep"
            fi
        done
    fi
}

#############################################################################
# Installation Mode Selection
#############################################################################

check_interactive_mode() {
    # Check if stdin is a terminal (not piped from curl)
    if [ ! -t 0 ]; then
        print_header
        print_error "Interactive mode requires a terminal"
        echo ""
        echo "You're running this script in a pipe (e.g., curl | bash)"
        echo "For interactive mode, download the script first:"
        echo ""
        echo -e "${CYAN}# Download the script${NC}"
        echo "curl -fsSL https://raw.githubusercontent.com/darrenhinde/opencode-agents/main/install.sh -o install.sh"
        echo ""
        echo -e "${CYAN}# Run interactively${NC}"
        echo "bash install.sh"
        echo ""
        echo "Or use a profile directly:"
        echo ""
        echo -e "${CYAN}# Quick install with profile${NC}"
        echo "curl -fsSL https://raw.githubusercontent.com/darrenhinde/opencode-agents/main/install.sh | bash -s core"
        echo ""
        echo "Available profiles: core, developer, full, advanced"
        echo ""
        cleanup_and_exit 1
    fi
}

show_main_menu() {
    check_interactive_mode
    
    clear
    print_header
    
    echo -e "${BOLD}Choose installation mode:${NC}\n"
    echo "  1) Quick Install (Choose a profile)"
    echo "  2) Custom Install (Pick individual components)"
    echo "  3) List Available Components"
    echo "  4) Exit"
    echo ""
    read -p "Enter your choice [1-4]: " choice
    
    case $choice in
        1) INSTALL_MODE="profile" ;;
        2) INSTALL_MODE="custom" ;;
        3) list_components; show_main_menu ;;
        4) cleanup_and_exit 0 ;;
        *) print_error "Invalid choice"; sleep 2; show_main_menu ;;
    esac
}

#############################################################################
# Profile Installation
#############################################################################

show_profile_menu() {
    clear
    print_header
    
    echo -e "${BOLD}Available Installation Profiles:${NC}\n"
    
    # Core profile
    local core_desc=$(jq -r '.profiles.core.description' "$TEMP_DIR/registry.json")
    local core_count=$(jq -r '.profiles.core.components | length' "$TEMP_DIR/registry.json")
    echo -e "  ${GREEN}1) Core${NC}"
    echo -e "     ${core_desc}"
    echo -e "     Components: ${core_count}\n"
    
    # Developer profile
    local dev_desc=$(jq -r '.profiles.developer.description' "$TEMP_DIR/registry.json")
    local dev_count=$(jq -r '.profiles.developer.components | length' "$TEMP_DIR/registry.json")
    echo -e "  ${BLUE}2) Developer${NC}"
    echo -e "     ${dev_desc}"
    echo -e "     Components: ${dev_count}\n"
    
    # Full profile
    local full_desc=$(jq -r '.profiles.full.description' "$TEMP_DIR/registry.json")
    local full_count=$(jq -r '.profiles.full.components | length' "$TEMP_DIR/registry.json")
    echo -e "  ${MAGENTA}3) Full${NC}"
    echo -e "     ${full_desc}"
    echo -e "     Components: ${full_count}\n"
    
    # Advanced profile
    local adv_desc=$(jq -r '.profiles.advanced.description' "$TEMP_DIR/registry.json")
    local adv_count=$(jq -r '.profiles.advanced.components | length' "$TEMP_DIR/registry.json")
    echo -e "  ${YELLOW}4) Advanced${NC}"
    echo -e "     ${adv_desc}"
    echo -e "     Components: ${adv_count}\n"
    
    echo "  5) Back to main menu"
    echo ""
    read -p "Enter your choice [1-5]: " choice
    
    case $choice in
        1) PROFILE="core" ;;
        2) PROFILE="developer" ;;
        3) PROFILE="full" ;;
        4) PROFILE="advanced" ;;
        5) show_main_menu; return ;;
        *) print_error "Invalid choice"; sleep 2; show_profile_menu; return ;;
    esac
    
    # Load profile components (compatible with bash 3.2+)
    SELECTED_COMPONENTS=()
    local temp_file="$TEMP_DIR/components.tmp"
    get_profile_components "$PROFILE" > "$temp_file"
    while IFS= read -r component; do
        [ -n "$component" ] && SELECTED_COMPONENTS+=("$component")
    done < "$temp_file"
    
    show_installation_preview
}

#############################################################################
# Custom Component Selection
#############################################################################

show_custom_menu() {
    clear
    print_header
    
    echo -e "${BOLD}Select component categories to install:${NC}\n"
    echo "Use space to toggle, Enter to continue"
    echo ""
    
    local categories=("agents" "subagents" "commands" "tools" "plugins" "contexts" "config")
    local selected_categories=()
    
    # Simple selection (for now, we'll make it interactive later)
    echo "Available categories:"
    for i in "${!categories[@]}"; do
        local cat="${categories[$i]}"
        local count=$(jq -r ".components.${cat} | length" "$TEMP_DIR/registry.json")
        local cat_display=$(echo "$cat" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        echo "  $((i+1))) ${cat_display} (${count} available)"
    done
    echo "  $((${#categories[@]}+1))) Select All"
    echo "  $((${#categories[@]}+2))) Continue to component selection"
    echo "  $((${#categories[@]}+3))) Back to main menu"
    echo ""
    
    read -p "Enter category numbers (space-separated) or option: " -a selections
    
    for sel in "${selections[@]}"; do
        if [ "$sel" -eq $((${#categories[@]}+1)) ]; then
            selected_categories=("${categories[@]}")
            break
        elif [ "$sel" -eq $((${#categories[@]}+2)) ]; then
            break
        elif [ "$sel" -eq $((${#categories[@]}+3)) ]; then
            show_main_menu
            return
        elif [ "$sel" -ge 1 ] && [ "$sel" -le ${#categories[@]} ]; then
            selected_categories+=("${categories[$((sel-1))]}")
        fi
    done
    
    if [ ${#selected_categories[@]} -eq 0 ]; then
        print_warning "No categories selected"
        sleep 2
        show_custom_menu
        return
    fi
    
    show_component_selection "${selected_categories[@]}"
}

show_component_selection() {
    local categories=("$@")
    clear
    print_header
    
    echo -e "${BOLD}Select components to install:${NC}\n"
    
    local all_components=()
    local component_details=()
    
    for category in "${categories[@]}"; do
        local cat_display=$(echo "$category" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        echo -e "${CYAN}${BOLD}${cat_display}:${NC}"
        
        local components=$(jq -r ".components.${category}[] | .id" "$TEMP_DIR/registry.json")
        
        local idx=1
        while IFS= read -r comp_id; do
            local comp_name=$(jq -r ".components.${category}[] | select(.id == \"${comp_id}\") | .name" "$TEMP_DIR/registry.json")
            local comp_desc=$(jq -r ".components.${category}[] | select(.id == \"${comp_id}\") | .description" "$TEMP_DIR/registry.json")
            
            echo "  ${idx}) ${comp_name}"
            echo "     ${comp_desc}"
            
            all_components+=("${category}:${comp_id}")
            component_details+=("${comp_name}|${comp_desc}")
            
            idx=$((idx+1))
        done <<< "$components"
        
        echo ""
    done
    
    echo "Enter component numbers (space-separated), 'all' for all, or 'done' to continue:"
    read -a selections
    
    for sel in "${selections[@]}"; do
        if [ "$sel" = "all" ]; then
            SELECTED_COMPONENTS=("${all_components[@]}")
            break
        elif [ "$sel" = "done" ]; then
            break
        elif [ "$sel" -ge 1 ] && [ "$sel" -le ${#all_components[@]} ]; then
            SELECTED_COMPONENTS+=("${all_components[$((sel-1))]}")
        fi
    done
    
    if [ ${#SELECTED_COMPONENTS[@]} -eq 0 ]; then
        print_warning "No components selected"
        sleep 2
        show_custom_menu
        return
    fi
    
    # Resolve dependencies
    print_step "Resolving dependencies..."
    local original_count=${#SELECTED_COMPONENTS[@]}
    for comp in "${SELECTED_COMPONENTS[@]}"; do
        resolve_dependencies "$comp"
    done
    
    if [ ${#SELECTED_COMPONENTS[@]} -gt $original_count ]; then
        print_info "Added $((${#SELECTED_COMPONENTS[@]} - original_count)) dependencies"
    fi
    
    show_installation_preview
}

#############################################################################
# Installation Preview & Confirmation
#############################################################################

show_installation_preview() {
    # Only clear screen in interactive mode
    if [ "$NON_INTERACTIVE" != true ]; then
        clear
    fi
    print_header
    
    echo -e "${BOLD}Installation Preview${NC}\n"
    
    if [ -n "$PROFILE" ]; then
        echo -e "Profile: ${GREEN}${PROFILE}${NC}"
    else
        echo -e "Mode: ${GREEN}Custom${NC}"
    fi
    
    echo -e "\nComponents to install (${#SELECTED_COMPONENTS[@]} total):\n"
    
    # Group by type
    local agents=()
    local subagents=()
    local commands=()
    local tools=()
    local plugins=()
    local contexts=()
    local configs=()
    
    for comp in "${SELECTED_COMPONENTS[@]}"; do
        local type="${comp%%:*}"
        case $type in
            agent) agents+=("$comp") ;;
            subagent) subagents+=("$comp") ;;
            command) commands+=("$comp") ;;
            tool) tools+=("$comp") ;;
            plugin) plugins+=("$comp") ;;
            context) contexts+=("$comp") ;;
            config) configs+=("$comp") ;;
        esac
    done
    
    [ ${#agents[@]} -gt 0 ] && echo -e "${CYAN}Agents (${#agents[@]}):${NC} ${agents[*]##*:}"
    [ ${#subagents[@]} -gt 0 ] && echo -e "${CYAN}Subagents (${#subagents[@]}):${NC} ${subagents[*]##*:}"
    [ ${#commands[@]} -gt 0 ] && echo -e "${CYAN}Commands (${#commands[@]}):${NC} ${commands[*]##*:}"
    [ ${#tools[@]} -gt 0 ] && echo -e "${CYAN}Tools (${#tools[@]}):${NC} ${tools[*]##*:}"
    [ ${#plugins[@]} -gt 0 ] && echo -e "${CYAN}Plugins (${#plugins[@]}):${NC} ${plugins[*]##*:}"
    [ ${#contexts[@]} -gt 0 ] && echo -e "${CYAN}Contexts (${#contexts[@]}):${NC} ${contexts[*]##*:}"
    [ ${#configs[@]} -gt 0 ] && echo -e "${CYAN}Config (${#configs[@]}):${NC} ${configs[*]##*:}"
    
    echo ""
    
    # Skip confirmation if profile was provided via command line
    if [ "$NON_INTERACTIVE" = true ]; then
        print_info "Installing automatically (profile specified)..."
        perform_installation
    else
        read -p "Proceed with installation? [Y/n]: " confirm
        
        if [[ $confirm =~ ^[Nn] ]]; then
            print_info "Installation cancelled"
            cleanup_and_exit 0
        fi
        
        perform_installation
    fi
}

#############################################################################
# Collision Detection
#############################################################################

show_collision_report() {
    local collision_count=$1
    shift
    local collisions=("$@")
    
    echo ""
    print_warning "Found ${collision_count} file collision(s):"
    echo ""
    
    # Group by type
    local agents=()
    local subagents=()
    local commands=()
    local tools=()
    local plugins=()
    local contexts=()
    local configs=()
    
    for file in "${collisions[@]}"; do
        # Skip empty entries
        [ -z "$file" ] && continue
        
        if [[ $file == *"/agent/subagents/"* ]]; then
            subagents+=("$file")
        elif [[ $file == *"/agent/"* ]]; then
            agents+=("$file")
        elif [[ $file == *"/command/"* ]]; then
            commands+=("$file")
        elif [[ $file == *"/tool/"* ]]; then
            tools+=("$file")
        elif [[ $file == *"/plugin/"* ]]; then
            plugins+=("$file")
        elif [[ $file == *"/context/"* ]]; then
            contexts+=("$file")
        else
            configs+=("$file")
        fi
    done
    
    # Display grouped collisions
    [ ${#agents[@]} -gt 0 ] && echo -e "${YELLOW}  Agents (${#agents[@]}):${NC}" && printf '    %s\n' "${agents[@]}"
    [ ${#subagents[@]} -gt 0 ] && echo -e "${YELLOW}  Subagents (${#subagents[@]}):${NC}" && printf '    %s\n' "${subagents[@]}"
    [ ${#commands[@]} -gt 0 ] && echo -e "${YELLOW}  Commands (${#commands[@]}):${NC}" && printf '    %s\n' "${commands[@]}"
    [ ${#tools[@]} -gt 0 ] && echo -e "${YELLOW}  Tools (${#tools[@]}):${NC}" && printf '    %s\n' "${tools[@]}"
    [ ${#plugins[@]} -gt 0 ] && echo -e "${YELLOW}  Plugins (${#plugins[@]}):${NC}" && printf '    %s\n' "${plugins[@]}"
    [ ${#contexts[@]} -gt 0 ] && echo -e "${YELLOW}  Context (${#contexts[@]}):${NC}" && printf '    %s\n' "${contexts[@]}"
    [ ${#configs[@]} -gt 0 ] && echo -e "${YELLOW}  Config (${#configs[@]}):${NC}" && printf '    %s\n' "${configs[@]}"
    
    echo ""
}

get_install_strategy() {
    echo -e "${BOLD}How would you like to proceed?${NC}\n"
    echo "  1) ${GREEN}Skip existing${NC} - Only install new files, keep all existing files unchanged"
    echo "  2) ${YELLOW}Overwrite all${NC} - Replace existing files with new versions (your changes will be lost)"
    echo "  3) ${CYAN}Backup & overwrite${NC} - Backup existing files, then install new versions"
    echo "  4) ${RED}Cancel${NC} - Exit without making changes"
    echo ""
    read -p "Enter your choice [1-4]: " strategy_choice
    
    case $strategy_choice in
        1) echo "skip" ;;
        2) 
            echo ""
            print_warning "This will overwrite existing files. Your changes will be lost!"
            read -p "Are you sure? Type 'yes' to confirm: " confirm
            if [ "$confirm" = "yes" ]; then
                echo "overwrite"
            else
                echo "cancel"
            fi
            ;;
        3) echo "backup" ;;
        4) echo "cancel" ;;
        *) echo "cancel" ;;
    esac
}

#############################################################################
# Installation
#############################################################################

perform_installation() {
    print_step "Preparing installation..."
    
    # Create directory structure if it doesn't exist
    mkdir -p "$INSTALL_DIR"/{agent/subagents,command,tool,plugin,context/{core,project}}
    
    # Check for collisions
    local collisions=()
    for comp in "${SELECTED_COMPONENTS[@]}"; do
        local type="${comp%%:*}"
        local id="${comp##*:}"
        local registry_key=$(get_registry_key "$type")
        local path=$(jq -r ".components.${registry_key}[] | select(.id == \"${id}\") | .path" "$TEMP_DIR/registry.json")
        
        if [ -n "$path" ] && [ "$path" != "null" ] && [ -f "$path" ]; then
            collisions+=("$path")
        fi
    done
    
    # Determine installation strategy
    local install_strategy="fresh"
    
    if [ ${#collisions[@]} -gt 0 ]; then
        show_collision_report ${#collisions[@]} "${collisions[@]}"
        install_strategy=$(get_install_strategy)
        
        if [ "$install_strategy" = "cancel" ]; then
            print_info "Installation cancelled by user"
            cleanup_and_exit 0
        fi
        
        # Handle backup strategy
        if [ "$install_strategy" = "backup" ]; then
            local backup_dir="${INSTALL_DIR}.backup.$(date +%Y%m%d-%H%M%S)"
            print_step "Creating backup..."
            
            # Only backup files that will be overwritten
            local backup_count=0
            for file in "${collisions[@]}"; do
                if [ -f "$file" ]; then
                    local backup_file="${backup_dir}/${file}"
                    mkdir -p "$(dirname "$backup_file")"
                    if cp "$file" "$backup_file" 2>/dev/null; then
                        ((backup_count++))
                    else
                        print_warning "Failed to backup: $file"
                    fi
                fi
            done
            
            if [ $backup_count -gt 0 ]; then
                print_success "Backed up ${backup_count} file(s) to $backup_dir"
                install_strategy="overwrite"  # Now we can overwrite
            else
                print_error "Backup failed. Installation cancelled."
                cleanup_and_exit 1
            fi
        fi
    fi
    
    # Perform installation
    print_step "Installing components..."
    
    local installed=0
    local skipped=0
    local failed=0
    
    for comp in "${SELECTED_COMPONENTS[@]}"; do
        local type="${comp%%:*}"
        local id="${comp##*:}"
        
        # Get the correct registry key (handles singular/plural)
        local registry_key=$(get_registry_key "$type")
        
        # Get component path
        local path=$(jq -r ".components.${registry_key}[] | select(.id == \"${id}\") | .path" "$TEMP_DIR/registry.json")
        
        if [ -z "$path" ] || [ "$path" = "null" ]; then
            print_warning "Could not find path for ${comp}"
            ((failed++))
            continue
        fi
        
        # Check if file exists before we install (for proper messaging)
        local file_existed=false
        if [ -f "$path" ]; then
            file_existed=true
        fi
        
        # Check if file exists and we're in skip mode
        if [ "$file_existed" = true ] && [ "$install_strategy" = "skip" ]; then
            print_info "Skipped existing: ${type}:${id}"
            ((skipped++))
            continue
        fi
        
        # Download component
        local url="${RAW_URL}/${path}"
        local dest="${path}"
        
        # Create parent directory if needed
        mkdir -p "$(dirname "$dest")"
        
        if curl -fsSL "$url" -o "$dest"; then
            # Show appropriate message based on whether file existed before
            if [ "$file_existed" = true ]; then
                print_success "Updated ${type}: ${id}"
            else
                print_success "Installed ${type}: ${id}"
            fi
            ((installed++))
        else
            print_error "Failed to install ${type}: ${id}"
            ((failed++))
        fi
    done
    
    # Handle additional paths for advanced profile
    if [ "$PROFILE" = "advanced" ]; then
        local additional_paths=$(jq -r '.profiles.advanced.additionalPaths[]?' "$TEMP_DIR/registry.json")
        if [ -n "$additional_paths" ]; then
            print_step "Installing additional paths..."
            while IFS= read -r path; do
                # For directories, we'd need to recursively download
                # For now, just note them
                print_info "Additional path: $path (manual download required)"
            done <<< "$additional_paths"
        fi
    fi
    
    echo ""
    print_success "Installation complete!"
    echo -e "  Installed: ${GREEN}${installed}${NC}"
    [ $skipped -gt 0 ] && echo -e "  Skipped: ${CYAN}${skipped}${NC}"
    [ $failed -gt 0 ] && echo -e "  Failed: ${RED}${failed}${NC}"
    
    show_post_install
}

#############################################################################
# Post-Installation
#############################################################################

show_post_install() {
    echo ""
    print_step "Next Steps"
    
    echo "1. Review the installed components in .opencode/"
    echo "2. Copy env.example to .env and configure:"
    echo "   ${CYAN}cp env.example .env${NC}"
    echo "3. Start using OpenCode agents:"
    echo "   ${CYAN}opencode${NC}"
    echo ""
    
    if [ -d "${INSTALL_DIR}.backup."* ] 2>/dev/null; then
        print_info "Backup created - you can restore files from .opencode.backup.* if needed"
    fi
    
    print_info "Documentation: ${REPO_URL}"
    echo ""
    
    cleanup_and_exit 0
}

#############################################################################
# Component Listing
#############################################################################

list_components() {
    clear
    print_header
    
    echo -e "${BOLD}Available Components${NC}\n"
    
    local categories=("agents" "subagents" "commands" "tools" "plugins" "contexts")
    
    for category in "${categories[@]}"; do
        local cat_display=$(echo "$category" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
        echo -e "${CYAN}${BOLD}${cat_display}:${NC}"
        
        local components=$(jq -r ".components.${category}[] | \"\(.id)|\(.name)|\(.description)\"" "$TEMP_DIR/registry.json")
        
        while IFS='|' read -r id name desc; do
            echo -e "  ${GREEN}${name}${NC} (${id})"
            echo -e "    ${desc}"
        done <<< "$components"
        
        echo ""
    done
    
    read -p "Press Enter to continue..."
}

#############################################################################
# Cleanup
#############################################################################

cleanup_and_exit() {
    rm -rf "$TEMP_DIR"
    exit "$1"
}

trap 'cleanup_and_exit 1' INT TERM

#############################################################################
# Main
#############################################################################

main() {
    # Parse command line arguments
    case "${1:-}" in
        core|--core)
            INSTALL_MODE="profile"
            PROFILE="core"
            NON_INTERACTIVE=true
            ;;
        developer|--developer)
            INSTALL_MODE="profile"
            PROFILE="developer"
            NON_INTERACTIVE=true
            ;;
        full|--full)
            INSTALL_MODE="profile"
            PROFILE="full"
            NON_INTERACTIVE=true
            ;;
        advanced|--advanced)
            INSTALL_MODE="profile"
            PROFILE="advanced"
            NON_INTERACTIVE=true
            ;;
        list|--list)
            check_dependencies
            fetch_registry
            list_components
            cleanup_and_exit 0
            ;;
        --help|-h|help)
            print_header
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  core, --core           Install core profile"
            echo "  developer, --developer Install developer profile"
            echo "  full, --full           Install full profile"
            echo "  advanced, --advanced   Install advanced profile"
            echo "  list, --list           List all available components"
            echo "  help, --help, -h       Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 core"
            echo "  $0 --developer"
            echo "  curl -fsSL https://raw.githubusercontent.com/darrenhinde/opencode-agents/main/install.sh | bash -s core"
            echo ""
            echo "Without options, runs in interactive mode"
            exit 0
            ;;
    esac
    
    check_bash_version
    check_dependencies
    fetch_registry
    
    if [ -n "$PROFILE" ]; then
        # Non-interactive mode (compatible with bash 3.2+)
        SELECTED_COMPONENTS=()
        local temp_file="$TEMP_DIR/components.tmp"
        get_profile_components "$PROFILE" > "$temp_file"
        while IFS= read -r component; do
            [ -n "$component" ] && SELECTED_COMPONENTS+=("$component")
        done < "$temp_file"
        show_installation_preview
    else
        # Interactive mode
        show_main_menu
        
        if [ "$INSTALL_MODE" = "profile" ]; then
            show_profile_menu
        elif [ "$INSTALL_MODE" = "custom" ]; then
            show_custom_menu
        fi
    fi
}

main "$@"
