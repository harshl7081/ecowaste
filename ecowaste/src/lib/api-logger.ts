import { NextRequest, NextResponse } from 'next/server';
import logger, { LogLevel } from './logger';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Middleware function that logs API requests
 * @param request The incoming request
 * @param handler The route handler function
 * @param routeName The name/path of the route
 */
export async function withLogging(
  request: NextRequest,
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  routeName: string,
  ...args: any[]
): Promise<NextResponse> {
  const startTime = Date.now();
  const method = request.method;
  const url = request.url;
  
  // Extract IP address
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Extract user agent
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Try to get user ID if authenticated
  let userId: string | undefined;
  try {
    const user = await currentUser();
    userId = user?.id;
  } catch (error) {
    // No authenticated user
  }
  
  // Log the request
  logger.info(`API Request: ${method} ${url}`, {
    route: routeName,
    method,
    url,
    ip,
    userAgent,
    userId,
  });
  
  try {
    // Call the original handler
    const response = await handler(request, ...args);
    
    // Log the response
    const duration = Date.now() - startTime;
    const status = response.status;
    
    // Choose log level based on status code
    const level = status >= 500 ? LogLevel.ERROR : 
                 status >= 400 ? LogLevel.WARNING : 
                 LogLevel.INFO;
    
    logger.log(level, `API Response: ${method} ${url} ${status} (${duration}ms)`, {
      route: routeName,
      method,
      url,
      status,
      duration,
      ip,
      userAgent,
      userId,
    });
    
    return response;
  } catch (error) {
    // Log the error
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error(`API Error: ${method} ${url} (${duration}ms) - ${errorMessage}`, {
      route: routeName,
      method,
      url,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      duration,
      ip,
      userAgent,
      userId,
    });
    
    // Re-throw the error to be handled by the API route's error handling
    throw error;
  }
} 