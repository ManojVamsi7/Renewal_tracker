import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    const response = NextResponse.json({ success: true })
    
    // Set auth cookie
    response.cookies.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    response.cookies.set('user_email', email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to set auth' },
      { status: 400 }
    )
  }
}
