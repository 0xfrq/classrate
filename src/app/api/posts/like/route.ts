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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
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

    // Check if user already liked this post
    const existingLike = await (prisma as any).postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id
        }
      }
    })

    if (existingLike) {
      // Unlike the post
      await (prisma as any).postLike.delete({
        where: { id: existingLike.id }
      })
      
      return NextResponse.json({ liked: false })
    } else {
      // Like the post
      await (prisma as any).postLike.create({
        data: {
          postId,
          userId: user.id
        }
      })
      
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
