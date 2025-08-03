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

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('id')

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Check if post exists and user owns it
    const post = await (prisma as any).post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.authorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete related data first (replies, likes)
    await (prisma as any).reply.deleteMany({
      where: { postId: postId }
    })

    await (prisma as any).postLike.deleteMany({
      where: { postId: postId }
    })

    // Delete the post
    await (prisma as any).post.delete({
      where: { id: postId }
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
