import { PostFeed } from '@/components/post-feed'
import { ClassReviews } from '@/components/class-reviews'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export default function Home() {
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
          
          {/* Class Reviews Section */}
          <div className="lg:col-span-1 order-2 lg:order-3">
            <ClassReviews />
          </div>
        </div>
      </div>
    </div>
  )
}
