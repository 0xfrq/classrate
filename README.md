# RateClass

A Twitter-like class review application built with Next.js, allowing students to share experiences, rate classes, and manage course-related tasks.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/classrate.git
cd classrate
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main entities:

- **User**: User accounts and profiles
- **Post**: Microblog posts and discussions  
- **Class**: Course information and metadata
- **ClassReview**: Final semester reviews and ratings for classes
- **LectureReview**: Individual lecture reviews and ratings
- **Lecture**: Lecture information linked to classes
- **Exercise**: Optional to-do items and assignments

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Backend API endpoints
│   │   ├── classes/       # Class management
│   │   ├── lecture-reviews/ # Lecture review system  
│   │   ├── reviews/       # Final class reviews
│   │   └── posts/         # Microblog posts
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Navigation header
│   ├── sidebar.tsx       # Left sidebar with semester progress
│   ├── post-feed.tsx     # Main microblog feed
│   ├── class-reviews.tsx # Three-tab class management system
│   └── create-*-dialog.tsx # Form dialogs for creating content
├── lib/                  # Utility functions
│   ├── db.ts            # Prisma database connection
│   └── utils.ts         # Helper functions
└── prisma/              # Database schema and migrations
    └── schema.prisma    # Database schema definition
```

## Features

- **Semester System**: 8-semester progression tracking
- **Three-Tab Workflow**: 
  1. Add Classes → 2. Review Lectures → 3. Final Reviews
- **Microblogging**: Twitter-like posts for class discussions
- **Class Management**: Add and organize courses by semester
- **Lecture Reviews**: Rate individual lectures with comments
- **Final Reviews**: End-of-semester class evaluations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
