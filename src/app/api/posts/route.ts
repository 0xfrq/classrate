import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
    const posts = await (prisma as any).post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        likes: true,
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
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

    const { content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const post = await (prisma as any).post.create({
      data: {
        content: content.trim(),
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true
          }
        }
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
