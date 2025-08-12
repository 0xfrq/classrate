"use client"

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CreateLectureReviewDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onReviewCreated?: () => void
  children?: React.ReactNode
}

interface ClassOption {
  id: string
  code: string
  name: string
}

export function CreateLectureReviewDialog({ open, onOpenChange, onReviewCreated, children }: CreateLectureReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [formData, setFormData] = useState({
    classCode: '',
    lectureTitle: '',
    lectureNumber: 1,
    date: '',
    rating: 0,
    review: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const getJakartaDate = () => {
    const now = new Date()
    const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
    return jakartaTime.toISOString().split('T')[0]
  }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log('Fetching classes...')
        const response = await fetch('/api/classes')
        console.log('Classes response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Classes data:', data)
          const mappedClasses = data.map((classItem: any) => ({
            id: classItem.id,
            code: classItem.code,
            name: classItem.name
          }))
          console.log('Mapped classes:', mappedClasses)
          setClasses(mappedClasses)
        }
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }

    if (open || isOpen) {
      console.log('Dialog opened, fetching classes...')
      fetchClasses()
      setFormData(prev => ({
        ...prev,
        date: getJakartaDate()
      }))
    }
  }, [open, isOpen])

  useEffect(() => {
    const getNextLectureNumber = async () => {
      if (!formData.classCode) return

      try {
        const response = await fetch('/api/lecture-reviews')
        if (response.ok) {
          const data = await response.json()
          const classLectures = data.filter((review: any) => 
            review.lecture.class.code === formData.classCode
          )
          const maxLectureNumber = Math.max(
            0, 
            ...classLectures.map((review: any) => review.lecture.lectureNumber || 0)
          )
          setFormData(prev => ({
            ...prev,
            lectureNumber: maxLectureNumber + 1
          }))
        }
      } catch (error) {
        console.error('Error fetching lecture numbers:', error)
        setFormData(prev => ({ ...prev, lectureNumber: 1 }))
      }
    }

    getNextLectureNumber()
  }, [formData.classCode])

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleSubmit = async () => {
    if (!formData.classCode || !formData.lectureTitle || !formData.rating || !formData.review) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/lecture-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classCode: formData.classCode,
          lectureTitle: formData.lectureTitle,
          lectureNumber: formData.lectureNumber || null,
          lectureDate: formData.date || null,
          rating: formData.rating,
          content: formData.review
        }),
      })

      if (response.ok) {
        setFormData({
          classCode: '',
          lectureTitle: '',
          lectureNumber: 1,
          date: getJakartaDate(),
          rating: 0,
          review: ''
        })
        handleOpenChange(false)
        onReviewCreated?.()
      } else {
        let errorMessage = 'Failed to create lecture review'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (e) {
          // If response is not JSON, use default message
          console.error('Non-JSON error response:', e)
        }
        alert(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error creating lecture review:', error)
      alert('Failed to create lecture review. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              star <= formData.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onClick={() => handleRatingClick(star)}
          />
        ))}
        {formData.rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {formData.rating} star{formData.rating !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    )
  }

  if (children) {
    return (
      <>
        <div onClick={() => handleOpenChange(true)}>
          {children}
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-[90vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review a Lecture</DialogTitle>
              <DialogDescription>
                Share your thoughts about a specific lecture to help your classmates.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classCode">Class *</Label>
                  <Select
                    value={formData.classCode}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, classCode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classOption) => (
                        <SelectItem key={classOption.id} value={classOption.code}>
                          {classOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {classes.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No classes found. Add a class first.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lectureNumber">Lecture Number</Label>
                  <Input
                    id="lectureNumber"
                    placeholder="Auto-generated"
                    type="number"
                    value={formData.lectureNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, lectureNumber: parseInt(e.target.value) || 1 }))}
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically set to next number
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lectureTitle">Lecture Title *</Label>
                <Input
                  id="lectureTitle"
                  placeholder="e.g., Binary Trees and Search Algorithms"
                  value={formData.lectureTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, lectureTitle: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Lecture Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Rating *</Label>
                {renderStars()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="review">Lecture Review *</Label>
                <Textarea
                  id="review"
                  placeholder="How was the lecture? Was the material clear? Did you understand the concepts? Any tips for future students?"
                  value={formData.review}
                  onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
                  className="min-h-[100px] md:min-h-[120px]"
                  maxLength={500}
                />
                <div className="text-sm text-muted-foreground">
                  {formData.review.length}/500 characters
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.classCode || !formData.lectureTitle || !formData.rating || !formData.review || isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Adding Review...' : 'Add Lecture Review'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <Dialog open={open || false} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review a Lecture</DialogTitle>
          <DialogDescription>
            Share your thoughts about a specific lecture to help your classmates.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classCode">Class *</Label>
              <Select
                value={formData.classCode}
                onValueChange={(value) => setFormData(prev => ({ ...prev, classCode: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classOption) => (
                    <SelectItem key={classOption.id} value={classOption.code}>
                      {classOption.code} - {classOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {classes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No classes found. Add a class first.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lectureNumber">Lecture Number</Label>
              <Input
                id="lectureNumber"
                placeholder="Auto-generated"
                type="number"
                value={formData.lectureNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, lectureNumber: parseInt(e.target.value) || 1 }))}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Automatically set to next number
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lectureTitle">Lecture Title *</Label>
            <Input
              id="lectureTitle"
              placeholder="e.g., Binary Trees and Search Algorithms"
              value={formData.lectureTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, lectureTitle: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Lecture Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Automatically set to today (Jakarta time)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Rating *</Label>
            {renderStars()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Lecture Review *</Label>
            <Textarea
              id="review"
              placeholder="How was the lecture? Was the material clear? Did you understand the concepts? Any tips for future students?"
              value={formData.review}
              onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
              className="min-h-[100px] md:min-h-[120px]"
              maxLength={500}
            />
            <div className="text-sm text-muted-foreground">
              {formData.review.length}/500 characters
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.classCode || !formData.lectureTitle || !formData.rating || !formData.review || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Adding Review...' : 'Add Lecture Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
