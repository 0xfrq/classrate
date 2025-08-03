import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const reviews = await prisma.classReview.findMany({
      include: {
        class: true,
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { classCode, className, instructor, semester, rating, content } = await request.json()

    if (!classCode?.trim() || !rating || !content?.trim()) {
      return NextResponse.json({ error: 'Class code, rating, and content are required' }, { status: 400 })
    }

    const defaultUser = await prisma.user.upsert({
      where: { email: 'default@example.com' },
      update: {},
      create: {
        email: 'default@example.com',
        name: 'Current User',
      },
    })

    const classRecord = await prisma.class.upsert({
      where: { code: classCode },
      update: {
        name: className || undefined,
        instructor: instructor || undefined,
        semester: semester || undefined,
      },
      create: {
        code: classCode,
        name: className || classCode,
        instructor: instructor || undefined,
        semester: semester || undefined,
      },
    })

    const review = await prisma.classReview.create({
      data: {
        rating,
        content,
        classId: classRecord.id,
        userId: defaultUser.id,
      },
      include: {
        class: true,
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
