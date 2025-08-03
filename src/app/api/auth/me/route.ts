import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth-user')
    
    if (!authCookie) {
      return NextResponse.json({ user: null })
    }

    const user = JSON.parse(authCookie.value)
    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}
