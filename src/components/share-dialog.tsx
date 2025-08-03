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

  const captureCardAsImage = async () => {
    if (!cardRef.current) return null

    try {
      setIsCapturing(true)
      
      // Use a simpler approach - create a styled div as an image
      const cardData = createCardImageData()
      return cardData
    } catch (error) {
      console.error('Error capturing card:', error)
      return null
    } finally {
      setIsCapturing(false)
    }
  }

  // Create a simple base64 image from text content
  const createCardImageData = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Set canvas size for better Instagram compatibility
    canvas.width = 500
    canvas.height = 400
    
    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add subtle border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
    
    // Add classrate header
    ctx.fillStyle = '#8b5cf6'
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('classrate.', 30, 50)
    
    // Add author name
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    const authorName = item.type === 'post' ? item.author?.name : item.user?.name
    if (authorName) {
      ctx.fillText(authorName, 30, 85)
    }
    
    // Add type badge
    ctx.fillStyle = '#6b7280'
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    const typeText = item.type === 'post' ? 'Post' : `📚 Lecture Review`
    ctx.fillText(typeText, 30, 105)
    
    // Add rating for reviews
    let yOffset = 125
    if (item.type === 'lecture-review' && item.rating) {
      const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating)
      ctx.fillStyle = '#f59e0b'
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillText(`${stars} (${item.rating}/5)`, 30, yOffset)
      yOffset += 25
    }
    
    // Add class info for reviews
    if (item.type === 'lecture-review' && item.lecture) {
      ctx.fillStyle = '#6b7280'
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      const classInfo = `${item.lecture.class.name} (${item.lecture.class.code})`
      ctx.fillText(classInfo, 30, yOffset)
      yOffset += 20
      
      if (item.lecture.title) {
        ctx.fillText(item.lecture.title, 30, yOffset)
        yOffset += 25
      } else {
        yOffset += 15
      }
    }
    
    // Add content (wrap text)
    ctx.fillStyle = '#374151'
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    const maxWidth = 440
    const lineHeight = 24
    let y = yOffset
    
    const words = item.content.split(' ')
    let line = ''
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      
      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, 30, y)
        line = words[i] + ' '
        y += lineHeight
        
        // Stop if we're getting too long
        if (y > 320) {
          ctx.fillText(line.slice(0, -3) + '...', 30, y)
          break
        }
      } else {
        line = testLine
      }
    }
    
    if (y <= 320) {
      ctx.fillText(line, 30, y)
    }
    
    // Add footer branding
    ctx.fillStyle = '#8b5cf6'
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('Share your class experiences on classrate.', 30, canvas.height - 30)
    
    return canvas.toDataURL('image/png', 1.0)
  }

  const handleInstagramStory = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (!isMobile) {
      alert('Instagram story sharing is only available on mobile devices')
      return
    }

    try {
      // Capture the card as image first
      const imageDataUrl = await captureCardAsImage()
      
      if (imageDataUrl) {
        // For Instagram, we need to try a different approach
        // Option 1: Use Instagram's media sharing URL scheme (Android)
        if (navigator.userAgent.includes('Android')) {
          try {
            const response = await fetch(imageDataUrl)
            const blob = await response.blob()
            
            // Try using Instagram's sharing intent with the image
            const formData = new FormData()
            formData.append('source_application', 'classrate')
            formData.append('media', blob, 'classrate-story.png')
            
            // Create a temporary form to submit
            const tempForm = document.createElement('form')
            tempForm.method = 'POST'
            tempForm.action = 'instagram://share'
            tempForm.style.display = 'none'
            
            const mediaInput = document.createElement('input')
            mediaInput.type = 'file'
            mediaInput.name = 'media'
            
            // Convert blob to file
            const file = new File([blob], 'classrate-story.png', { type: 'image/png' })
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(file)
            mediaInput.files = dataTransfer.files
            
            tempForm.appendChild(mediaInput)
            document.body.appendChild(tempForm)
            
            // Try to submit to Instagram
            window.location.href = 'instagram://share'
            
            // Clean up
            setTimeout(() => {
              document.body.removeChild(tempForm)
            }, 1000)
            
          } catch (intentError) {
            console.error('Instagram intent failed:', intentError)
            // Fallback to download + manual share
            downloadAndInstructUser(imageDataUrl)
          }
        } 
        // Option 2: Download image and provide instructions (iOS and fallback)
        else {
          downloadAndInstructUser(imageDataUrl)
        }
      } else {
        // Image generation failed, fallback to deep link
        window.location.href = 'instagram://story-camera'
      }
      
      setIsOpen(false)
    } catch (error) {
      console.error('Instagram sharing failed:', error)
      
      // Final fallback to deep link
      try {
        window.location.href = 'instagram://story-camera'
        setIsOpen(false)
      } catch (deepLinkError) {
        alert('Instagram app not found. Please install Instagram to share stories.')
      }
    }
  }

  const downloadAndInstructUser = (imageDataUrl: string) => {
    try {
      // Create download link
      const link = document.createElement('a')
      link.href = imageDataUrl
      link.download = `classrate-${item.type}-${Date.now()}.png`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Show instructions
      setTimeout(() => {
        const proceed = confirm(
          'Image downloaded! To share to Instagram:\n\n' +
          '1. Open Instagram\n' +
          '2. Tap the + button\n' +
          '3. Select "Story"\n' +
          '4. Choose the downloaded image from your gallery\n' +
          '5. Share your classrate post!\n\n' +
          'Click OK to open Instagram now.'
        )
        
        if (proceed) {
          window.location.href = 'instagram://story-camera'
        }
      }, 500)
      
    } catch (downloadError) {
      console.error('Download failed:', downloadError)
      alert('Unable to download image. Please try again or screenshot the preview.')
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
            <p className="font-medium text-pink-700 mb-1">📱 Instagram Story Sharing:</p>
            <ul className="space-y-1 text-pink-600">
              <li>• Image will be downloaded to your device</li>
              <li>• Open Instagram and create a new story</li>
              <li>• Select the downloaded image from gallery</li>
              <li>• Perfect for sharing your classrate posts!</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
