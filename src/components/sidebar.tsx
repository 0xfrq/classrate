"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CreatePostDialog } from '@/components/create-post-dialog'

export function Sidebar() {
  const [showCreatePost, setShowCreatePost] = useState(false)

  const semesters = [
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
  ]

  return (
    <div className="space-y-4 md:space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Semester Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {semesters.map((semester, index) => (
              <div 
                key={index} 
                className={`p-2 rounded-lg text-center text-xs ${
                  index < 2 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : index === 2 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {semester}
                {index < 2 && ' ✓'}
                {index === 2 && ' 📚'}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Currently in Semester 3
          </p>
        </CardContent>
      </Card>

      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
      />
    </div>
  )
}
