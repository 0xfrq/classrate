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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const replies = await (prisma as any).reply.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(replies)
  } catch (error) {
    console.error('Error fetching replies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
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

    const { postId, content } = await request.json()

    if (!postId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      )
    }

    // Check if post exists
    const post = await (prisma as any).post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const reply = await (prisma as any).reply.create({
      data: {
        content: content.trim(),
        postId,
        authorId: user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    })

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}
