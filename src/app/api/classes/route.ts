import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, instructor, semester } = body

    if (!code || !name || !instructor || !semester) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existingClass = await prisma.class.findUnique({
      where: { code }
    })

    if (existingClass) {
      return NextResponse.json(
        { error: 'Class with this code already exists' },
        { status: 400 }
      )
    }

    const newClass = await prisma.class.create({
      data: {
        code,
        name,
        instructor,
        semester
      }
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    )
  }
}
