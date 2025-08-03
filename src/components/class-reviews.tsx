"use client"

import { useState, useEffect } from 'react'
import { Star, Plus, BookOpen, Calendar, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateClassDialog } from '@/components/create-class-dialog'
import { CreateReviewDialog } from '@/components/create-review-dialog'
import { CreateLectureReviewDialog } from '@/components/create-lecture-review-dialog'

interface Class {
  id: string
  code: string
  name: string
  instructor: string
  semester: string
}

interface ClassReview {
  id: string
  className: string
  classCode: string
  rating: number
  review: string
  semester: string
  instructor: string
}

interface LectureReview {
  id: string
  lectureTitle: string
  lectureNumber?: number
  date?: string
  classCode: string
  rating: number
  content: string
}

export function ClassReviews() {
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showCreateReview, setShowCreateReview] = useState(false)
  const [showCreateLectureReview, setShowCreateLectureReview] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [reviews, setReviews] = useState<ClassReview[]>([])
  const [lectureReviews, setLectureReviews] = useState<LectureReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

    fetchClasses()
  }, [])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews')
        if (response.ok) {
          const data = await response.json()
          setReviews(data.map((review: any) => ({
            id: review.id,
            className: review.class.name,
            classCode: review.class.code,
            rating: review.rating,
            review: review.content,
            semester: review.class.semester || 'N/A',
            instructor: review.class.instructor || 'N/A'
          })))
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  useEffect(() => {
    const fetchLectureReviews = async () => {
      try {
        const response = await fetch('/api/lecture-reviews')
        if (response.ok) {
          const data = await response.json()
          setLectureReviews(data.map((review: any) => ({
            id: review.id,
            lectureTitle: review.lecture.title,
            lectureNumber: review.lecture.number,
            date: review.lecture.date ? new Date(review.lecture.date).toLocaleDateString() : undefined,
            classCode: review.lecture.class.code,
            rating: review.rating,
            content: review.content
          })))
        }
      } catch (error) {
        console.error('Error fetching lecture reviews:', error)
      }
    }

    fetchLectureReviews()
  }, [])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Class Management</h2>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lectures" className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">Lecture Reviews</span>
            <span className="sm:hidden">Lectures</span>
          </TabsTrigger>
          <TabsTrigger value="final" className="flex items-center gap-1 text-xs">
            <GraduationCap className="h-3 w-3" />
            <span className="sm:inline">Final Reviews</span>
            <span className="sm:hidden">Final</span>
          </TabsTrigger>
        </TabsList>


        <TabsContent value="lectures" className="space-y-4">

          {classes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Add Classes First</h3>
                <p className="text-muted-foreground">
                  You need to add classes before you can review lectures
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {lectureReviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Lecture Reviews</h3>
                    <p className="text-muted-foreground mb-4">
                      Review individual lectures as you attend them
                    </p>
                    <Button onClick={() => setShowCreateLectureReview(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Review Your First Lecture
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                lectureReviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base md:text-lg truncate">{review.lectureTitle}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{review.classCode}</Badge>
                            {review.lectureNumber && (
                              <span className="text-xs">Lecture {review.lectureNumber}</span>
                            )}
                            {review.date && (
                              <span className="text-xs">{review.date}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{review.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="final" className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => setShowCreateReview(true)}
              className="w-full sm:w-auto"
              disabled={classes.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="sm:inline">Final Review</span>
              <span className="sm:hidden">Review</span>
            </Button>
          </div>

          {classes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Add Classes First</h3>
                <p className="text-muted-foreground">
                  You need to add classes before you can write final reviews
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Final Reviews</h3>
                    <p className="text-muted-foreground mb-4">
                      Write comprehensive reviews at the end of the semester
                    </p>
                    <Button onClick={() => setShowCreateReview(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Write Your First Final Review
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base md:text-lg truncate">{review.classCode}</CardTitle>
                          <p className="text-sm text-muted-foreground truncate">{review.className}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{review.semester}</Badge>
                        <span className="truncate">{review.instructor}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{review.review}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateClassDialog
        open={showCreateClass}
        onOpenChange={setShowCreateClass}
        onClassCreated={() => {
          fetch('/api/classes')
            .then(res => res.json())
            .then(data => setClasses(data))
            .catch(console.error)
        }}
      />

      <CreateReviewDialog
        open={showCreateReview}
        onOpenChange={setShowCreateReview}
      />

      <CreateLectureReviewDialog
        open={showCreateLectureReview}
        onOpenChange={setShowCreateLectureReview}
      />
    </div>
  )
}
