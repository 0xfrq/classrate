"use client"

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Share, MoreHorizontal, Star, Plus, Send, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CreatePostDialog } from '@/components/create-post-dialog'
import { CreateLectureReviewDialog } from '@/components/create-lecture-review-dialog'

interface PostLike {
  id: string
  userId: string
}

interface Reply {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  _count: {
    likes: number
  }
}

interface Post {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  likes: PostLike[]
  _count: {
    likes: number
    replies: number
  }
  replies?: Reply[]
  classTag?: string
  type: 'post'
}

interface LectureReview {
  id: string
  content: string
  rating: number
  user: {
    id: string
    name: string
    avatar?: string
  }
  lecture: {
    title: string
    lectureNumber?: number
    class: {
      name: string
      code: string
    }
  }
  createdAt: Date
  type: 'lecture-review'
}

type FeedItem = Post | LectureReview

export function PostFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [replyText, setReplyText] = useState<{ [postId: string]: string }>({})
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        setCurrentUser(data.user)
      } catch (error) {
        console.error('Error getting current user:', error)
      }
    }
    getCurrentUser()
  }, [])

  const fetchFeedData = async () => {
    try {
      const [postsResponse, lectureReviewsResponse] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/lecture-reviews')
      ])

      const posts = postsResponse.ok ? await postsResponse.json() : []
      const lectureReviews = lectureReviewsResponse.ok ? await lectureReviewsResponse.json() : []

      const formattedPosts: Post[] = posts.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        type: 'post'
      }))

      const formattedLectureReviews: LectureReview[] = lectureReviews.map((review: any) => ({
        ...review,
        createdAt: new Date(review.createdAt),
        type: 'lecture-review'
      }))

      const combinedFeed = [...formattedPosts, ...formattedLectureReviews]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      setFeedItems(combinedFeed)
    } catch (error) {
      console.error('Error fetching feed data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFeedData()
  }, [])

  const handleLike = async (postId: string) => {
    if (likingPosts.has(postId)) return

    setLikingPosts(prev => new Set(prev).add(postId))
    
    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        await fetchFeedData() // Refresh to get updated like counts
      }
    } catch (error) {
      console.error('Error liking post:', error)
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  const handleReply = async (postId: string) => {
    const content = replyText[postId]?.trim()
    if (!content) return

    try {
      const response = await fetch('/api/posts/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, content }),
      })

      if (response.ok) {
        setReplyText(prev => ({ ...prev, [postId]: '' }))
        await fetchReplies(postId)
        await fetchFeedData() // Refresh to get updated reply counts
      }
    } catch (error) {
      console.error('Error creating reply:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/posts/delete?id=${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchFeedData() // Refresh feed
      } else {
        const error = await response.json()
        alert(`Failed to delete post: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this lecture review?')) return

    try {
      const response = await fetch(`/api/lecture-reviews/delete?id=${reviewId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchFeedData() // Refresh feed
      } else {
        const error = await response.json()
        alert(`Failed to delete review: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  const fetchReplies = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/replies?postId=${postId}`)
      if (response.ok) {
        const replies = await response.json()
        setFeedItems(prev => prev.map(item => {
          if (item.type === 'post' && item.id === postId) {
            return {
              ...item,
              replies: replies.map((reply: any) => ({
                ...reply,
                createdAt: new Date(reply.createdAt)
              }))
            }
          }
          return item
        }))
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const toggleReplies = async (postId: string) => {
    const newExpanded = new Set(expandedReplies)
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId)
    } else {
      newExpanded.add(postId)
      await fetchReplies(postId)
    }
    setExpandedReplies(newExpanded)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const isPostLikedByUser = (post: Post) => {
    return currentUser && post.likes.some(like => like.userId === currentUser.id)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="h-10 bg-muted rounded animate-pulse flex-1"></div>
          <div className="h-10 bg-muted rounded animate-pulse flex-1"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
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
      {/* Action Buttons - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <CreatePostDialog onPostCreated={fetchFeedData}>
          <Button className="w-full sm:flex-1 hover:bg-gray-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </CreatePostDialog>
        
        <CreateLectureReviewDialog onReviewCreated={fetchFeedData}>
          <Button variant="outline" className="w-full sm:flex-1 border-black text-black-600 hover:bg-gray-200">
            <Star className="h-4 w-4 mr-2" />
            Review Lecture
          </Button>
        </CreateLectureReviewDialog>
      </div>

      {feedItems.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow py-4">
          <CardContent className="px-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {item.type === 'post' 
                    ? item.author.name.split(' ').map(n => n[0]).join('')
                    : item.user.name.split(' ').map(n => n[0]).join('')
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h3 className="font-semibold text-sm">
                    {item.type === 'post' ? item.author.name : item.user.name}
                  </h3>
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </span>
                  {item.type === 'post' && item.classTag && (
                    <Badge variant="secondary" className="text-xs">
                      {item.classTag}
                    </Badge>
                  )}
                  {item.type === 'lecture-review' && (
                    <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                      📚 Lecture Review
                    </Badge>
                  )}
                </div>

                {item.type === 'lecture-review' && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{item.lecture.class.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.lecture.class.code}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(item.rating)}
                      </div>
                    </div>
                    <p className="text-sm font-medium mb-1">
                      {item.lecture.title}
                      {item.lecture.lectureNumber && ` - Lecture ${item.lecture.lectureNumber}`}
                    </p>
                  </div>
                )}
                
                <p className="mt-2 text-sm text-foreground">{item.content}</p>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-6">
                    {item.type === 'post' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-muted-foreground hover:text-red-500 ${
                            isPostLikedByUser(item) ? 'text-red-500' : ''
                          }`}
                          onClick={() => handleLike(item.id)}
                          disabled={likingPosts.has(item.id)}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${
                            isPostLikedByUser(item) ? 'fill-current' : ''
                          }`} />
                          {item._count.likes}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground hover:text-blue-500"
                          onClick={() => toggleReplies(item.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {item._count.replies}
                        </Button>
                      </>
                    )}
                    
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Delete button - only show for content owner */}
                  {((item.type === 'post' && currentUser && item.author.id === currentUser.id) ||
                    (item.type === 'lecture-review' && currentUser && item.user.id === currentUser.id)) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-red-500"
                      onClick={() => {
                        if (item.type === 'post') {
                          handleDeletePost(item.id)
                        } else {
                          handleDeleteReview(item.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Replies Section */}
                {item.type === 'post' && expandedReplies.has(item.id) && (
                  <div className="mt-4 space-y-3">
                    {/* Reply Input */}
                    <div className="flex space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {currentUser?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex space-x-2">
                        <Input
                          placeholder="Write a reply..."
                          value={replyText[item.id] || ''}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [item.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleReply(item.id)
                            }
                          }}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleReply(item.id)}
                          disabled={!replyText[item.id]?.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Replies List */}
                    {item.replies && item.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-2 ml-4 pl-4 border-l-2 border-gray-100">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {reply.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm">{reply.author.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mt-1">{reply.content}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 h-6 px-1">
                              <Heart className="h-3 w-3 mr-1" />
                              {reply._count.likes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
