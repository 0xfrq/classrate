"use client"

import { useState, useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreateClassDialog } from '@/components/create-class-dialog'

interface Class {
  id: string
  name: string
  code: string
  instructor: string
  semester: string
  createdAt: string
}

export function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes')
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete "${className}"? This will also delete all related lectures and reviews.`)) return

    try {
      const response = await fetch(`/api/classes/delete?id=${classId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchClasses() // Refresh classes
      } else {
        const error = await response.json()
        alert(`Failed to delete class: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Failed to delete class')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Classes</CardTitle>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No classes found. Add your first class to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {classes.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold">{classItem.name}</h3>
                    <Badge variant="secondary">{classItem.code}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {classItem.instructor} • {classItem.semester}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-red-500"
                  onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <CreateClassDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          onClassCreated={() => {
            fetchClasses()
            setIsDialogOpen(false)
          }}
        />
      </CardContent>
    </Card>
  )
}
