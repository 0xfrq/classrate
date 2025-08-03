import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const lectureReviews = await (prisma as any).lectureReview.findMany({
      include: {
        lecture: {
          include: {
            class: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(lectureReviews)
  } catch (error) {
    console.error('Error fetching lecture reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lecture reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classCode, lectureTitle, lectureNumber, rating, content } = body

    // Validate required fields
    if (!classCode || !lectureTitle || !rating || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if class exists
    const existingClass = await (prisma as any).class.findUnique({
      where: { code: classCode }
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found. Please add the class first.' },
        { status: 404 }
      )
    }

    // Find or create lecture
    let existingLecture = await (prisma as any).lecture.findFirst({
      where: {
        classId: existingClass.id,
        title: lectureTitle,
        lectureNumber: lectureNumber || 1
      }
    })

    if (!existingLecture) {
      existingLecture = await (prisma as any).lecture.create({
        data: {
          title: lectureTitle,
          lectureNumber: lectureNumber || 1,
          classId: existingClass.id
        }
      })
    }

    // Get or create user
    let user = await (prisma as any).user.findFirst()
    if (!user) {
      user = await (prisma as any).user.create({
        data: {
          name: 'Demo User',
          email: 'demo@example.com'
        }
      })
    }

    // Create lecture review
    const lectureReview = await (prisma as any).lectureReview.create({
      data: {
        rating: parseInt(rating),
        content,
        lectureId: existingLecture.id,
        userId: user.id
      },
      include: {
        lecture: {
          include: {
            class: true
          }
        },
        user: true
      }
    })

    return NextResponse.json(lectureReview, { status: 201 })
  } catch (error) {
    console.error('Error creating lecture review:', error)
    return NextResponse.json(
      { error: 'Failed to create lecture review' },
      { status: 500 }
    )
  }
}
