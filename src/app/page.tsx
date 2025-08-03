"use client"

import { useState, useEffect } from 'react'
import { PostFeed } from '@/components/post-feed'
import { GoogleCalendar } from '@/components/google-calendar'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { AuthDialog } from '@/components/auth-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { User, Lock } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
        } else {
          setAuthDialogOpen(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthDialogOpen(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const showAuth = document.cookie.includes('show-auth=true')
    if (showAuth) {
      setAuthDialogOpen(true)
      document.cookie = 'show-auth=; Max-Age=0; path=/'
    }
  }, [])

  const handleAuthSuccess = (userData: User) => {
    setUser(userData)
    setAuthDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-1 order-3 lg:order-1">
              <Card className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <div className="rounded-full bg-muted h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="lg:col-span-1 order-2 lg:order-3">
              <Card className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="mb-4">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
                <p className="text-muted-foreground mb-6">
                  Please sign in to access RateClass and see class reviews from your peers.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Join our community of students</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Your data is secure with us</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-3 lg:order-1">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-4 lg:space-y-6">
            <PostFeed />
          </div>
          
          {/* Google Calendar Section */}
          <div className="lg:col-span-1 order-2 lg:order-3">
            <GoogleCalendar />
          </div>
        </div>
      </div>
    </div>
  )
}
