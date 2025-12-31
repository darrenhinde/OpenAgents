/**
 * Multi-Agent Logging System - Logger
 * 
 * Pretty-prints delegation hierarchies with visual indentation and formatting.
 */

import { SessionTracker } from './session-tracker.js';
import {
  formatSessionHeader,
  formatMessage,
  formatToolCall,
  formatDelegation,
  formatChildLinked,
  formatSessionComplete,
  formatSystemMessage,
} from './formatters.js';

/**
 * Multi-agent logger with hierarchy-aware formatting
 */
export class MultiAgentLogger {
  private tracker: SessionTracker;
  private enabled: boolean;
  private verbose: boolean;
  
  constructor(enabled = true, verbose = false) {
    this.tracker = new SessionTracker();
    this.enabled = enabled;
    this.verbose = verbose;
  }
  
  /**
   * Log session start
   */
  logSessionStart(sessionId: string, agent: string, parentId?: string): void {
    if (!this.enabled) return;
    
    this.tracker.registerSession(sessionId, agent, parentId);
    const node = this.tracker.getSession(sessionId);
    
    if (!node) return;
    
    // Only log session headers in verbose mode
    if (this.verbose) {
      const header = formatSessionHeader(sessionId, agent, node.depth, parentId);
      console.log(header);
    }
  }
  
  /**
   * Log delegation event
   */
  logDelegation(
    parentSessionId: string,
    toAgent: string,
    prompt: string
  ): string {
    if (!this.enabled) return '';
    
    const delegationId = this.tracker.recordDelegation(parentSessionId, toAgent, prompt);
    const node = this.tracker.getSession(parentSessionId);
    const depth = node?.depth ?? 0;
    
    // Only log delegation details in verbose mode
    if (this.verbose) {
      const formatted = formatDelegation(toAgent, prompt, depth);
      console.log(formatted);
    }
    
    return delegationId;
  }
  
  /**
   * Log child session linked to delegation
   */
  logChildLinked(delegationId: string, childSessionId: string): void {
    if (!this.enabled) return;
    
    this.tracker.linkChildSession(delegationId, childSessionId);
    
    const delegation = this.tracker.getDelegation(delegationId);
    if (!delegation) return;
    
    const parent = this.tracker.getSession(delegation.parentSessionId);
    const depth = parent?.depth ?? 0;
    
    // Always log child session link (important for delegation visibility)
    const formatted = formatChildLinked(childSessionId, depth, this.verbose);
    console.log(formatted);
  }
  
  /**
   * Log user or assistant message
   */
  logMessage(sessionId: string, role: 'user' | 'assistant', text: string): void {
    if (!this.enabled) return;
    
    // Only log messages in verbose mode
    if (!this.verbose) return;
    
    const node = this.tracker.getSession(sessionId);
    const depth = node?.depth ?? 0;
    
    const formatted = formatMessage(role, text, depth);
    console.log(formatted);
  }
  
  /**
   * Log tool call
   */
  logToolCall(sessionId: string, tool: string, input: any): void {
    if (!this.enabled) return;
    
    // Skip logging task tool (handled by logDelegation)
    if (tool === 'task') return;
    
    // Only log tool calls in verbose mode
    if (!this.verbose) return;
    
    const node = this.tracker.getSession(sessionId);
    const depth = node?.depth ?? 0;
    
    const formatted = formatToolCall(tool, input, depth);
    console.log(formatted);
  }
  
  /**
   * Log session completion
   */
  logSessionComplete(sessionId: string): void {
    if (!this.enabled) return;
    
    const node = this.tracker.getSession(sessionId);
    if (!node) return;
    
    this.tracker.completeSession(sessionId);
    
    const duration = node.endTime 
      ? node.endTime - node.startTime 
      : Date.now() - node.startTime;
    
    const sessionType = node.depth === 0 ? 'PARENT' : 'CHILD';
    
    // Always log child session completion (important for delegation visibility)
    // Only log parent completion in verbose mode
    if (sessionType === 'CHILD' || this.verbose) {
      const formatted = formatSessionComplete(sessionType, duration, node.depth, node.agent, this.verbose);
      console.log(formatted);
    }
  }
  
  /**
   * Log system message
   */
  logSystem(sessionId: string, message: string): void {
    if (!this.enabled) return;
    
    // Only log system messages in verbose mode
    if (!this.verbose) return;
    
    const node = this.tracker.getSession(sessionId);
    const depth = node?.depth ?? 0;
    
    const formatted = formatSystemMessage(message, depth);
    console.log(formatted);
  }
  
  /**
   * Get the session tracker for analysis
   */
  getTracker(): SessionTracker {
    return this.tracker;
  }
  
  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * Check if logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  
  /**
   * Clear all tracked data
   */
  clear(): void {
    this.tracker.clear();
  }
}
