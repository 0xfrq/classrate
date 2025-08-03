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

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess: (user: any) => void
}

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rememberMe: true
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: isLogin ? undefined : formData.name,
          rememberMe: formData.rememberMe
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onAuthSuccess(data.user)
        onOpenChange(false)
        setFormData({ email: '', password: '', name: '', rememberMe: true })
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Welcome Back!' : 'Create Account'}</DialogTitle>
          <DialogDescription>
            {isLogin 
              ? 'Sign in to continue using ClassRate' 
              : 'Join ClassRate to share and discover class reviews'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked: boolean) => 
                setFormData(prev => ({ ...prev, rememberMe: checked }))
              }
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Remember me (stay logged in forever)
            </Label>
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading 
                ? (isLogin ? 'Signing in...' : 'Creating account...') 
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
