import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  
  // Clear auth cookies
  response.cookies.set('auth_token', '', {
    maxAge: 0,
  })
  
  response.cookies.set('user_email', '', {
    maxAge: 0,
  })

  return response
}
