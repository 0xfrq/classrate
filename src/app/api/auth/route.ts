import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, rememberMe, isLogin } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (isLogin) {
      // Login flow
      const user = await (prisma as any).user.findUnique({
        where: { email }
      })

      if (!user || !user.password) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Set auth cookie
      const response = NextResponse.json({ 
        user: { id: user.id, email: user.email, name: user.name } 
      })
      
      const maxAge = rememberMe ? 365 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // Forever or 1 week
      
      response.cookies.set('auth-user', JSON.stringify({ 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }), {
        maxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })

      return response
    } else {
      // Registration flow
      const existingUser = await (prisma as any).user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 400 }
        )
      }

      if (!name || name.trim() === '') {
        return NextResponse.json(
          { error: 'Name is required for registration' },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(password, 12)

      const user = await (prisma as any).user.create({
        data: {
          email,
          password: hashedPassword,
          name: name.trim(),
        }
      })

      // Set auth cookie
      const response = NextResponse.json({ 
        user: { id: user.id, email: user.email, name: user.name } 
      })
      
      const maxAge = rememberMe ? 365 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // Forever or 1 week
      
      response.cookies.set('auth-user', JSON.stringify({ 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }), {
        maxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })

      return response
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
