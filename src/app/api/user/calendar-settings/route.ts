import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from 'next/headers'

async function getAuthUser() {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('auth-user')
    if (!authCookie) return null
    return JSON.parse(authCookie.value)
  } catch (error) {
    return null
  }
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's calendar settings
    const userSettings = await (prisma as any).user.findUnique({
      where: { id: user.id },
      select: {
        calendarId: true,
        calendarApiKey: true,
        calendarEmbedCode: true
      }
    })

    return NextResponse.json({
      calendarId: userSettings?.calendarId || '',
      apiKey: userSettings?.calendarApiKey || '',
      embedCode: userSettings?.calendarEmbedCode || ''
    })
  } catch (error) {
    console.error('Error fetching calendar settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { calendarId, apiKey, embedCode } = body

    // Update user's calendar settings
    await (prisma as any).user.update({
      where: { id: user.id },
      data: {
        calendarId: calendarId || null,
        calendarApiKey: apiKey || null,
        calendarEmbedCode: embedCode || null
      }
    })

    return NextResponse.json({ message: 'Calendar settings saved successfully' })
  } catch (error) {
    console.error('Error saving calendar settings:', error)
    return NextResponse.json(
      { error: 'Failed to save calendar settings' },
      { status: 500 }
    )
  }
}
