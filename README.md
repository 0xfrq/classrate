# RateClass

A Twitter-like class review application built with Next.js, allowing students to share experiences, rate classes, and manage course-related tasks.

## Features

### 🐦 Microblogging Feed
- Twitter-like posts for class discussions
- Real-time updates and interactions
- Class-specific hashtags and mentions
- Like, comment, and share functionality

### ⭐ Class Rating System
- 1-5 star rating system for classes
- Detailed reviews and feedback
- Instructor and semester information
- Class recommendations based on ratings

### 📝 Review Management
- Create, read, update, and delete class reviews
- Search and filter reviews by class, instructor, or semester
- Anonymous review options
- Helpful/unhelpful voting system

### ✅ Exercise To-Do Management (Optional)
- Track assignments and exercises for each class
- Due date reminders and notifications
- Mark tasks as complete
- Progress tracking across multiple classes

### 🔄 Database Synchronization
- Real-time data persistence with Prisma ORM
- SQLite database for local development
- Automatic data syncing across sessions
- Data backup and recovery features

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui + Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Language**: TypeScript
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rateclass.git
cd rateclass
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main entities:

- **User**: User accounts and profiles
- **Post**: Microblog posts and discussions
- **Class**: Course information and metadata
- **ClassReview**: User reviews and ratings for classes
- **Exercise**: Optional to-do items and assignments

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── header.tsx      # Navigation header
│   ├── sidebar.tsx     # Left sidebar with stats
│   ├── post-feed.tsx   # Main microblog feed
│   └── class-reviews.tsx # Class rating section
├── lib/                # Utility functions
│   ├── db.ts          # Database connection
│   └── utils.ts       # Helper functions
└── prisma/             # Database schema and migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
