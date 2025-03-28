"use client";

import { useEffect } from "react";
import { logClientActivity } from "@/lib/logger";
import { usePathname } from "next/navigation";

export default function ClickLogger() {
  const pathname = usePathname();

  useEffect(() => {
    // Log page view when component mounts or pathname changes
    logClientActivity('page_view', { pathname });

    // Function to handle clicks
    const handleClick = (e: MouseEvent) => {
      // Get the clicked element
      const target = e.target as HTMLElement;
      
      // Try to find the nearest button, link, or interactive element
      const clickableElement = findClickableElement(target);
      
      if (clickableElement) {
        // Extract element information
        const elementId = clickableElement.id || undefined;
        const elementText = getElementText(clickableElement);
        const elementType = clickableElement.tagName.toLowerCase();
        
        // Get additional attributes
        const href = (clickableElement as HTMLAnchorElement).href;
        const formAction = (clickableElement as HTMLFormElement).action;
        
        // Log the click
        logClientActivity(
          'button_click', 
          { 
            elementType,
            href,
            formAction,
            x: e.clientX,
            y: e.clientY
          },
          elementId,
          elementText
        );
      }
    };

    // Add event listener
    document.addEventListener('click', handleClick);

    // Clean up
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}

// Helper function to find the nearest clickable element
function findClickableElement(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;
  
  // Check if the element itself is clickable
  if (
    element.tagName === 'BUTTON' ||
    element.tagName === 'A' ||
    element.tagName === 'INPUT' && ['button', 'submit', 'reset', 'checkbox', 'radio'].includes((element as HTMLInputElement).type) ||
    element.tagName === 'SELECT' ||
    element.getAttribute('role') === 'button' ||
    element.hasAttribute('data-log-click')
  ) {
    return element;
  }
  
  // Check parent elements (up to 5 levels)
  let parent = element.parentElement;
  let level = 0;
  
  while (parent && level < 5) {
    if (
      parent.tagName === 'BUTTON' ||
      parent.tagName === 'A' ||
      parent.getAttribute('role') === 'button' ||
      parent.hasAttribute('data-log-click')
    ) {
      return parent;
    }
    
    parent = parent.parentElement;
    level++;
  }
  
  return null;
}

// Helper function to get element text content
function getElementText(element: HTMLElement): string | undefined {
  // For buttons and links, try to get the visible text
  const text = element.innerText || element.textContent;
  
  // If no text is found, try to get aria-label or title
  if (!text || text.trim() === '') {
    return element.getAttribute('aria-label') || 
           element.getAttribute('title') || 
           element.getAttribute('alt') || 
           element.getAttribute('name') ||
           undefined;
  }
  
  // Truncate long text
  return text.trim().substring(0, 50);
} 