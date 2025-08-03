"use client"

import { useState, useRef } from 'react'
import { Share, Instagram, Copy, MessageCircle, Send, Camera } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ShareDialogProps {
  children: React.ReactNode
  item: {
    id: string
    content: string
    type: 'post' | 'lecture-review'
    author?: { name: string }
    user?: { name: string }
    lecture?: {
      title: string
      lectureNumber?: number
      class: { name: string, code: string }
    }
    rating?: number
    createdAt: Date
  }
}

export function ShareDialog({ children, item }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const shareText = item.type === 'post' 
    ? `Check out this post on classrate: "${item.content}"`
    : `Check out this lecture review on classrate: "${item.content}" - ${item.rating}/5 stars for ${item.lecture?.class.name}`
  
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://classrate.com'}`

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

  const captureCardAsImage = async () => {
    if (!cardRef.current) return null

    try {
      setIsCapturing(true)
      
      // Use modern browser APIs to capture the element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      const rect = cardRef.current.getBoundingClientRect()
      const scale = 2 // For better quality
      canvas.width = rect.width * scale
      canvas.height = rect.height * scale
      ctx.scale(scale, scale)

      // Create a white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Use html2canvas alternative approach
      const data = await html2canvasAlternative(cardRef.current)
      return data
    } catch (error) {
      console.error('Error capturing card:', error)
      return null
    } finally {
      setIsCapturing(false)
    }
  }

  // Alternative method using SVG foreignObject
  const html2canvasAlternative = async (element: HTMLElement) => {
    const data = new XMLSerializer().serializeToString(element)
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${element.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    return new Promise<string>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        canvas.width = 400
        canvas.height = 200
        
        // White background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')
        URL.revokeObjectURL(url)
        resolve(dataUrl)
      }
      img.onerror = reject
      img.src = url
    })
  }

  const handleInstagramStory = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (!isMobile) {
      alert('Instagram story sharing is only available on mobile devices')
      return
    }

    try {
      // Capture the card as image first
      const imageData = await captureCardAsImage()
      
      if (imageData) {
        // Convert base64 to blob
        const response = await fetch(imageData)
        const blob = await response.blob()
        
        // Try to share using Web Share API with image
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'classrate-post.png', { type: 'image/png' })] })) {
          await navigator.share({
            title: 'classrate.',
            text: shareText,
            files: [new File([blob], 'classrate-post.png', { type: 'image/png' })]
          })
        } else {
          // Fallback to Instagram deep links
          const instagramUrl = `instagram://story-camera`
          window.location.href = instagramUrl
          
          // Show instructions
          setTimeout(() => {
            alert('Image copied! Paste it in Instagram Stories. If Instagram didn\'t open, please open the Instagram app manually.')
          }, 1000)
        }
      } else {
        // Fallback to text sharing
        window.location.href = 'instagram://story-camera'
      }
      
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
          {/* Card Preview for Image Capture */}
          <div className="hidden">
            <Card ref={cardRef} className="w-96 mx-auto bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {item.type === 'post' 
                        ? item.author?.name.split(' ').map(n => n[0]).join('') 
                        : item.user?.name.split(' ').map(n => n[0]).join('')
                      }
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-sm text-gray-900">
                        {item.type === 'post' ? item.author?.name : item.user?.name}
                      </h3>
                      <span className="text-gray-500 text-sm">
                        {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                      </span>
                      {item.type === 'lecture-review' && (
                        <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                          📚 Lecture Review
                        </Badge>
                      )}
                    </div>

                    {item.type === 'lecture-review' && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm text-gray-900">{item.lecture?.class.name}</h4>
                            <p className="text-xs text-gray-600">{item.lecture?.class.code}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {item.rating && renderStars(item.rating)}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.lecture?.title}
                          {item.lecture?.lectureNumber && ` - Lecture ${item.lecture.lectureNumber}`}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-800 leading-relaxed">{item.content}</p>
                    
                    {/* classrate branding */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">classrate.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visible Preview */}
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
              disabled={isCapturing}
              className="flex items-center gap-2 h-12"
            >
              {isCapturing ? (
                <Camera className="h-5 w-5 animate-pulse" />
              ) : (
                <Instagram className="h-5 w-5 text-pink-500" />
              )}
              <span className="text-sm">
                {isCapturing ? 'Capturing...' : 'Instagram Story'}
              </span>
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

          {/* Instagram Tips */}
          <div className="text-xs text-gray-500 bg-pink-50 p-3 rounded-lg">
            <p className="font-medium text-pink-700 mb-1">📱 Instagram Story Tips:</p>
            <ul className="space-y-1 text-pink-600">
              <li>• Best viewed on mobile devices</li>
              <li>• Card will be captured as a sticker</li>
              <li>• White background for better visibility</li>
              <li>• Includes classrate branding</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
