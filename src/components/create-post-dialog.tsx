"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }
      
      setContent('')
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Share your thoughts about classes, ask questions, or start a discussion.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind about your classes?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-none shadow-none focus-visible:ring-0 p-0 text-lg"
                maxLength={280}
              />
              <div className="text-sm text-muted-foreground mt-2">
                {content.length}/280 characters
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!content.trim() || isLoading}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
