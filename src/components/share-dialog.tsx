"use client"

import { useState } from 'react'
import { Share, Instagram, Copy, MessageCircle, Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ShareDialogProps {
  children: React.ReactNode
  item: {
    id: string
    content: string
    type: 'post' | 'lecture-review'
    author?: { name: string }
    user?: { name: string }
    lecture?: {
      class: { name: string }
    }
    rating?: number
  }
}

export function ShareDialog({ children, item }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareText = item.type === 'post' 
    ? `Check out this post on classrate: "${item.content}"`
    : `Check out this lecture review on classrate: "${item.content}" - ${item.rating}/5 stars for ${item.lecture?.class.name}`
  
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://classrate.com'}`

  const handleInstagramStory = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (!isMobile) {
      alert('Instagram story sharing is only available on mobile devices')
      return
    }

    try {
      // Try Instagram story sharing
      window.location.href = 'instagram://story-camera'
      
      // Fallback to stories share link
      setTimeout(() => {
        try {
          window.location.href = 'instagram-stories://share'
        } catch (error) {
          console.error('Instagram stories share failed:', error)
          alert('Instagram app not found. Please install Instagram to share stories.')
        }
      }, 1000)
      
      setIsOpen(false)
    } catch (error) {
      console.error('Instagram app not available:', error)
      alert('Instagram app not found. Please install Instagram to share stories.')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy link')
    }
  }

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'classrate.',
          text: shareText,
          url: shareUrl,
        })
        setIsOpen(false)
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to Twitter
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
      window.open(twitterUrl, '_blank', 'width=600,height=400')
      setIsOpen(false)
    }
  }

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
  }

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    window.open(telegramUrl, '_blank')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share {item.type === 'post' ? 'Post' : 'Review'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">
                {item.type === 'post' ? item.author?.name : item.user?.name}
              </span>
              {item.type === 'lecture-review' && (
                <Badge variant="outline" className="text-xs">
                  📚 Lecture Review
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
            {item.type === 'lecture-review' && (
              <p className="text-xs text-gray-500 mt-1">
                {item.rating}/5 stars • {item.lecture?.class.name}
              </p>
            )}
          </div>

          {/* Sharing Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleInstagramStory}
              className="flex items-center gap-2 h-12"
            >
              <Instagram className="h-5 w-5 text-pink-500" />
              <span className="text-sm">Instagram Story</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center gap-2 h-12"
            >
              <Copy className="h-5 w-5" />
              <span className="text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleWebShare}
              className="flex items-center gap-2 h-12"
            >
              <Send className="h-5 w-5" />
              <span className="text-sm">Share via...</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2 h-12"
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">WhatsApp</span>
            </Button>
          </div>

          {/* Additional Options */}
          <div className="pt-2 border-t">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTelegramShare}
                className="flex-1"
              >
                Telegram
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
                  window.open(twitterUrl, '_blank', 'width=600,height=400')
                  setIsOpen(false)
                }}
                className="flex-1"
              >
                Twitter
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                  window.open(facebookUrl, '_blank', 'width=600,height=400')
                  setIsOpen(false)
                }}
                className="flex-1"
              >
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
