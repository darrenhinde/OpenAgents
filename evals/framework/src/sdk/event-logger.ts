/**
 * EventLogger - Event logging utilities
 * 
 * Handles logging of server events with meaningful details.
 * Extracted from test-runner.ts for better modularity.
 */

import type { ServerEvent } from './event-stream-handler.js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Track which messages we've already logged to avoid duplicates
const loggedMessages = new Set<string>();

/**
 * Log event with meaningful details
 * 
 * Event properties structure varies by type:
 * - session.created/updated: { id, title, ... }
 * - message.updated: { id, sessionID, role, ... }
 * - part.updated: { id, messageID, type, tool?, input?, output?, ... }
 */
export function logEvent(event: ServerEvent): void {
  // SDK wraps properties in 'info' object
  const props = event.properties?.info || event.properties || {};
  
  switch (event.type) {
    case 'session.created':
      console.log(`📋 Session created`);
      break;
      
    case 'session.updated':
      // Session updates are frequent but not very informative
      // Skip logging unless there's something specific
      break;
      
    case 'message.created':
      console.log(`💬 New message (${props.role || 'assistant'})`);
      break;
      
    case 'message.updated':
      // Message updates happen frequently during streaming
      // Only log once when message is complete (has parts)
      const showFull = process.env.DEBUG_VERBOSE === 'true';
      
      if (props.role === 'user' && showFull) {
        // Only log user messages once (when they have text)
        const promptText = getMessageText(props.id);
        if (!promptText) {
          // Skip if no text yet (message still being created)
          break;
        }
        
        // Check if we've already logged this message
        if (!loggedMessages.has(props.id)) {
          loggedMessages.add(props.id);
          
          console.log(`\n${'═'.repeat(70)}`);
          console.log(`👤 USER PROMPT`);
          console.log(`${'═'.repeat(70)}`);
          console.log(promptText);
          console.log(`${'═'.repeat(70)}\n`);
        }
      } else if (props.role === 'user' && !showFull) {
        if (!loggedMessages.has(props.id)) {
          loggedMessages.add(props.id);
          console.log(`👤 User message received`);
        }
      }
      
      // Log assistant messages in verbose mode (only once when complete)
      if (props.role === 'assistant' && showFull) {
        // Fetch actual response and tool calls from parts storage
        const parts = getMessageParts(props.id);
        
        // Only log if we have parts AND haven't logged this message yet
        if (parts.length > 0 && !loggedMessages.has(props.id)) {
          loggedMessages.add(props.id);
          
          console.log(`\n${'─'.repeat(70)}`);
          console.log(`🤖 ASSISTANT`);
          console.log(`${'─'.repeat(70)}`);
          
          for (const part of parts) {
            if ((part.type === 'text' || part.type === 'reasoning') && part.text) {
              console.log(part.text);
              console.log();
            } else if (part.type === 'tool') {
              const toolInput = part.state?.input || part.input || {};
              console.log(`🔧 TOOL CALL: ${part.tool}`);
              console.log(`   Input: ${JSON.stringify(toolInput, null, 2)}`);
              console.log();
            } else if (part.type === 'tool_result') {
              const result = (part.state?.result || part.result || '').toString().substring(0, 500);
              if (result) {
                console.log(`📊 TOOL RESULT:`);
                console.log(result + (result.length > 500 ? '...' : ''));
                console.log();
              }
            } else if (process.env.DEBUG_VERBOSE === 'true') {
              // Log unhandled part types for debugging
              console.log(`[DEBUG] Unhandled part type: ${part.type}`);
            }
          }
          
          console.log(`${'─'.repeat(70)}\n`);
        }
      }
      break;
      
    case 'part.created':
    case 'part.updated':
      if (process.env.DEBUG_VERBOSE === 'true') {
        console.log(`[DEBUG] ${event.type} - type: ${props.type}, id: ${props.id}`);
      }
      logPartEvent(props);
      break;
      
    case 'permission.request':
      console.log(`🔐 Permission requested: ${props.tool || 'unknown'}`);
      break;
      
    case 'permission.response':
      console.log(`🔐 Permission ${props.response === 'once' || props.approved ? 'granted' : 'denied'}`);
      break;
      
    case 'tool.call':
      console.log(`🔧 Tool call: ${props.tool || props.name || 'unknown'}`);
      break;
      
    case 'tool.result':
      const success = props.error ? '❌' : '✅';
      console.log(`${success} Tool result: ${props.tool || 'unknown'}`);
      break;
      
    default:
      // Skip unknown events to reduce noise
      break;
  }
}

/**
 * Log part events (tools, text, etc.)
 */
function logPartEvent(props: any): void {
  if (props.type === 'tool') {
    const toolName = props.tool || 'unknown';
    const status = props.state?.status || props.status || '';
    const showFull = process.env.DEBUG_VERBOSE === 'true';
    
    // Only log when tool starts or completes
    if (status === 'running' || status === 'pending') {
      console.log(`🔧 Tool: ${toolName} (starting)`);
      
      // Show tool input
      const input = props.state?.input || props.input || {};
      
      if (showFull) {
        console.log(`   Input: ${JSON.stringify(input, null, 2)}`);
      } else {
        if (input.command) {
          const cmd = input.command.substring(0, 70);
          console.log(`   └─ ${cmd}${input.command.length > 70 ? '...' : ''}`);
        } else if (input.filePath) {
          console.log(`   └─ ${input.filePath}`);
        } else if (input.pattern) {
          console.log(`   └─ pattern: ${input.pattern}`);
        }
      }
    } else if (status === 'completed') {
      console.log(`✅ Tool: ${toolName} (completed)`);
      
      if (showFull) {
        const result = props.state?.result || props.result || '';
        if (result) {
          const preview = result.substring(0, 300);
          console.log(`   Result: ${preview}${result.length > 300 ? '...' : ''}`);
        }
      }
    } else if (status === 'error') {
      console.log(`❌ Tool: ${toolName} (error)`);
    }
  } else if (props.type === 'text' || props.type === 'reasoning') {
    // Text/reasoning parts - show assistant response
    const text = props.text || '';
    if (text.length > 0) {
      // Check if we should show full text (when DEBUG_VERBOSE is set)
      const showFull = process.env.DEBUG_VERBOSE === 'true';
      
      if (showFull) {
        console.log(`\n${'─'.repeat(70)}`);
        console.log(`📝 ASSISTANT RESPONSE:`);
        console.log(`${'─'.repeat(70)}`);
        console.log(text);
        console.log(`${'─'.repeat(70)}\n`);
      } else {
        const preview = text.substring(0, 100).replace(/\n/g, ' ');
        console.log(`📝 ${preview}${text.length > 100 ? '...' : ''}`);
      }
    }
  }
}

/**
 * Get message text from parts storage
 */
function getMessageText(messageId: string): string | null {
  try {
    const partDir = join(homedir(), '.local', 'share', 'opencode', 'storage', 'part', messageId);
    
    if (!existsSync(partDir)) {
      return null;
    }
    
    const partFiles = readdirSync(partDir).filter(f => f.endsWith('.json'));
    const texts: string[] = [];
    
    for (const partFile of partFiles) {
      const part = JSON.parse(readFileSync(join(partDir, partFile), 'utf-8'));
      if ((part.type === 'text' || part.type === 'reasoning') && part.text) {
        texts.push(part.text);
      }
    }
    
    return texts.length > 0 ? texts.join('\n') : null;
  } catch (error) {
    return null;
  }
}

/**
 * Get message parts from storage (text, tools, tool results)
 * 
 * Note: Parts are written asynchronously, so we may need to wait a bit
 * for them to appear on disk. This function will retry a few times.
 */
function getMessageParts(messageId: string): any[] {
  try {
    const partDir = join(homedir(), '.local', 'share', 'opencode', 'storage', 'part', messageId);
    
    if (!existsSync(partDir)) {
      return [];
    }
    
    const partFiles = readdirSync(partDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const content = JSON.parse(readFileSync(join(partDir, f), 'utf-8'));
        return { file: f, content, created: content.time?.start || content.time?.created || 0 };
      })
      .sort((a, b) => a.created - b.created);
    
    return partFiles.map(pf => pf.content);
  } catch (error) {
    return [];
  }
}

/**
 * Clear logged messages tracking (call between tests)
 */
export function clearLoggedMessages(): void {
  loggedMessages.clear();
}

/**
 * Create a logger that respects debug mode
 * 
 * NOTE: DEBUG_VERBOSE should be set BEFORE calling this function
 * to ensure event handlers can check it immediately.
 */
export function createLogger(debug: boolean): {
  log: (message: string) => void;
  logEvent: (event: ServerEvent) => void;
} {
  return {
    log: (message: string) => {
      if (debug || message.includes('PASSED') || message.includes('FAILED')) {
        console.log(message);
      }
    },
    logEvent: (event: ServerEvent) => {
      if (debug) {
        logEvent(event);
      }
    },
  };
}
