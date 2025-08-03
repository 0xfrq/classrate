"use client"

import { BookOpen } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-primary">RateClass</h1>
          </div>
        </div>
      </div>
    </header>
  )
}
