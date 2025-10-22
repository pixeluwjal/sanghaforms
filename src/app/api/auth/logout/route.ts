import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  // Create response
  const response = NextResponse.json({ 
    message: 'Logged out successfully' 
  });

  // Clear the token cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });

  return response;
}