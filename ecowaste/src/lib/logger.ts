'use client';

// Client-side code only - no direct MongoDB imports here
export type LogAction = 
  | 'page_view' 
  | 'button_click' 
  | 'form_submit'
  | 'project_create'
  | 'project_update'
  | 'report_submit'
  | 'admin_action'
  | 'error';

export interface LogEntryData {
  userId?: string;
  action: LogAction;
  path: string;
  elementId?: string;
  elementText?: string;
  details?: Record<string, any>;
  userAgent?: string;
  ip?: string;
}

/**
 * Client-side logging function that sends logs to the API
 */
export function logClientActivity(action: LogAction, details?: Record<string, any>, elementId?: string, elementText?: string) {
  if (typeof window === 'undefined') return; // Only run on client
  
  const path = window.location.pathname;
  
  // Send log to API endpoint
  fetch('/api/logs/activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      path,
      elementId,
      elementText,
      details,
      userAgent: navigator.userAgent,
    }),
    // Use keepalive to ensure the request completes even if page navigates away
    keepalive: true
  }).catch(err => {
    console.error('Failed to send activity log:', err);
  });
} 