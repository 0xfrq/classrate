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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CreateClassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClassCreated?: () => void
}

export function CreateClassDialog({ open, onOpenChange, onClassCreated }: CreateClassDialogProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    instructor: '',
    semester: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const semesters = [
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code || !formData.name || !formData.instructor || !formData.semester) {
      alert('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
          code: '',
          name: '',
          instructor: '',
          semester: ''
        })
        onOpenChange(false)
        onClassCreated?.()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Failed to create class')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>
            Add a class you're taking this semester. You can review lectures and add a final review later.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Class Code *</Label>
              <Input
                id="code"
                placeholder="e.g., CS101"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Class Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Introduction to Computer Science"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor">Professor/Instructor *</Label>
            <Input
              id="instructor"
              placeholder="e.g., Dr. John Smith"
              value={formData.instructor}
              onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
              required
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Adding Class...' : 'Add Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
