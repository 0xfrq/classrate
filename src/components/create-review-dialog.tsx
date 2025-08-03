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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CreateReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ClassOption {
  id: string
  code: string
  name: string
  instructor: string
  semester: string
}

export function CreateReviewDialog({ open, onOpenChange }: CreateReviewDialogProps) {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [formData, setFormData] = useState({
    classCode: '',
    rating: 0,
    review: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes')
        if (response.ok) {
          const data = await response.json()
          setClasses(data)
        }
      } catch (error) {
        console.error('Error fetching classes:', error)
      }
    }

    if (open) {
      fetchClasses()
    }
  }, [open])

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleSubmit = async () => {
    if (!formData.classCode || !formData.rating || !formData.review) {
      return
    }

    const selectedClass = classes.find(c => c.code === formData.classCode)
    if (!selectedClass) {
      alert('Please select a valid class')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classCode: selectedClass.code,
          className: selectedClass.name,
          instructor: selectedClass.instructor,
          semester: selectedClass.semester,
          rating: formData.rating,
          content: formData.review,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create review')
      }
      
      setFormData({
        classCode: '',
        rating: 0,
        review: ''
      })
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      console.error('Error creating review:', error)
      alert('Failed to create review. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingClick(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 cursor-pointer transition-colors ${
                star <= formData.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
        {formData.rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {formData.rating} star{formData.rating !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Final Class Review</DialogTitle>
          <DialogDescription>
            Write a comprehensive review of your overall experience with this class.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 md:space-y-6">
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
            <Label>Overall Rating *</Label>
            {renderStars()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Final Review *</Label>
            <Textarea
              id="review"
              placeholder="Share your overall experience with this class. How was the teaching? Content quality? Difficulty level? Would you recommend it?"
              value={formData.review}
              onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
              className="min-h-[120px]"
              maxLength={1000}
            />
            <div className="text-sm text-muted-foreground">
              {formData.review.length}/1000 characters
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.classCode || !formData.rating || !formData.review || isLoading || classes.length === 0}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Adding Review...' : 'Add Final Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
