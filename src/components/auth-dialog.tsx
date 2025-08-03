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
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock, Mail, UserPlus, LogIn } from 'lucide-react'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess: (user: any) => void
}

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rememberMe: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Email and password are required')
        return
      }

      if (activeTab === 'register' && !formData.name.trim()) {
        setError('Name is required for registration')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
          rememberMe: formData.rememberMe,
          isLogin: activeTab === 'login'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Authentication failed')
        return
      }

      // Success
      onAuthSuccess(data.user)
      onOpenChange(false)
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        rememberMe: true
      })
      setError('')
    } catch (error) {
      console.error('Auth error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'login' | 'register')
    setError('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Welcome to RateClass</span>
          </DialogTitle>
          <DialogDescription>
            Join our community to share and discover class reviews
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center space-x-1">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center space-x-1">
              <UserPlus className="h-4 w-4" />
              <span>Sign Up</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
            </div>
          </TabsContent>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="remember-me"
              checked={formData.rememberMe}
              onCheckedChange={(checked: boolean) => 
                setFormData(prev => ({ ...prev, rememberMe: checked }))
              }
            />
            <Label htmlFor="remember-me" className="text-sm font-normal">
              Remember me (stay signed in forever)
            </Label>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {isLoading ? 'Loading...' : (activeTab === 'login' ? 'Sign In' : 'Sign Up')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
