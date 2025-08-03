import { NextRequest, NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  response.cookies.set('auth-user', '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })

  return response
}
