/**
 * API Proxy Route
 * Proxies requests to the backend VPS server to avoid HTTPS/HTTP mixed content issues
 * This allows the frontend (HTTPS on Vercel) to communicate with HTTP backend
 */
import { NextRequest, NextResponse } from 'next/server';

// Backend VPS URL - update this to match your backend
const BACKEND_URL = process.env.BACKEND_URL || 'http://62.171.183.44:8000';

// Configuration for retry and timeout
const FETCH_TIMEOUT_MS = 30000; // 30 seconds timeout
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second initial delay

// Log configuration on startup
console.log('[Proxy] Configuration:', { 
  BACKEND_URL, 
  envSet: !!process.env.BACKEND_URL,
  fetchTimeout: FETCH_TIMEOUT_MS,
  maxRetries: MAX_RETRIES
});

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

export async function HEAD(request: NextRequest) {
  return proxyRequest(request, 'HEAD');
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if an error is retryable (network errors, timeouts, etc.)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Retryable errors: network failures, connection refused, timeouts
    return (
      message.includes('fetch failed') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('abort') ||
      error.name === 'AbortError'
    );
  }
  return false;
}

async function proxyRequest(request: NextRequest, method: string) {
  // Get the path from the URL (everything after /api/proxy)
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/api/proxy')[1] || '';
  const queryString = url.search;
  
  // Construct the backend URL
  const backendUrl = `${BACKEND_URL}${pathSegments}${queryString}`;
  
  console.log(`[Proxy] ${method} ${backendUrl}`, {
    originalPath: url.pathname,
    pathSegments,
    queryString,
  });
  
  // Get request headers
  const headers: HeadersInit = {};
  request.headers.forEach((value, key) => {
    // Skip host and other headers that shouldn't be forwarded
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });
  
  // Get request body for POST, PUT, PATCH
  let body: string | undefined;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const text = await request.text();
      if (text) {
        body = text;
        console.log(`[Proxy] Request body length: ${text.length}`);
      }
    } catch (_) {
      console.log('[Proxy] No request body');
    }
  }
  
  let lastError: Error | null = null;
  
  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`[Proxy] Retry attempt ${attempt + 1}/${MAX_RETRIES} after ${delayMs}ms delay`);
        await sleep(delayMs);
      }
      
      // Make the request to the backend with timeout
      console.log(`[Proxy] Sending request to backend (attempt ${attempt + 1})...`);
      const response = await fetchWithTimeout(
        backendUrl,
        { method, headers, body },
        FETCH_TIMEOUT_MS
      );
      
      console.log(`[Proxy] Backend responded with status: ${response.status}`);
      
      // Get response body
      const responseText = await response.text();
      console.log(`[Proxy] Response body length: ${responseText.length}`);
      
      // Forward the response back to the client
      return new NextResponse(responseText, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          // Add CORS headers for the frontend
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
          'Access-Control-Allow-Headers': '*',
        },
      });
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      console.error(`[Proxy] Error on attempt ${attempt + 1}:`, {
        message: lastError.message,
        name: lastError.name,
        backend: BACKEND_URL,
        isRetryable: isRetryableError(error),
      });
      
      // Only retry if it's a retryable error and we have retries left
      if (!isRetryableError(error) || attempt === MAX_RETRIES - 1) {
        break;
      }
    }
  }
  
  // All retries exhausted or non-retryable error
  console.error('[Proxy] Final error after all retries:', {
    message: lastError?.message,
    stack: lastError?.stack,
    backend: BACKEND_URL,
    method,
    path: pathSegments,
  });
  
  return NextResponse.json(
    { 
      error: 'Proxy request failed', 
      details: lastError?.message || 'Unknown error',
      backend: BACKEND_URL,
      method,
      path: pathSegments,
      retriesAttempted: MAX_RETRIES,
    },
    { status: 502 } // Bad Gateway is more appropriate for upstream server failures
  );
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  console.log('[Proxy] OPTIONS request (CORS preflight)');
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
