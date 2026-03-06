/**
 * Server-side logging endpoint
 * This will show logs in Vercel logs
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, message, data, timestamp } = body;
    
    // This will appear in Vercel logs
    const logPrefix = `[CLIENT-${level?.toUpperCase() || 'LOG'}]`;
    const logMessage = `${logPrefix} ${timestamp || new Date().toISOString()}: ${message}`;
    
    if (level === 'error') {
      console.error(logMessage, data || '');
    } else if (level === 'warn') {
      console.warn(logMessage, data || '');
    } else {
      console.log(logMessage, data || '');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LOG-API] Error processing log:', error);
    return NextResponse.json({ success: false, error: 'Failed to log' }, { status: 500 });
  }
}
