"use client"

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Post {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
  }
  createdAt: Date
  likes: number
  comments: number
  classTag?: string
}

export function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        if (response.ok) {
          const data = await response.json()
          setPosts(data.map((post: any) => ({
            ...post,
            createdAt: new Date(post.createdAt)
          })))
        } else {
          const mockPosts: Post[] = [
            {
              id: '1',
              content: 'Just finished the midterm for CS 101. The algorithms section was challenging but fair. Professor Johnson really knows how to teach complex concepts simply! 💻',
              author: { name: 'Alex Chen' },
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
              likes: 12,
              comments: 3,
              classTag: 'CS 101'
            }
          ]
          setPosts(mockPosts)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        const mockPosts: Post[] = [
          {
            id: '1',
            content: 'Just finished the midterm for CS 101. The algorithms section was challenging but fair. Professor Johnson really knows how to teach complex concepts simply! 💻',
            author: { name: 'Alex Chen' },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            likes: 12,
            comments: 3,
            classTag: 'CS 101'
          }
        ]
        setPosts(mockPosts)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-1">
              <div className="flex space-x-3">
                <div className="rounded-full bg-muted h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow py-4">
          <CardContent className="px-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {post.author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm">{post.author.name}</h3>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                  </span>
                  {post.classTag && (
                    <Badge variant="secondary" className="text-xs">
                      {post.classTag}
                    </Badge>
                  )}
                </div>
                
                <p className="mt-2 text-sm text-foreground">{post.content}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-6">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
