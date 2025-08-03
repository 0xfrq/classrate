# Copilot Instructions for RateClass

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js class review application similar to Twitter, featuring:
- Microblogging functionality for class discussions
- Class rating system (1-5 stars)
- Review and feedback system
- Optional exercise to-do list
- Database integration with Prisma and SQLite

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI**: shadcn/ui components + Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Language**: TypeScript
- **Icons**: Lucide React

## Code Style Guidelines
- Use TypeScript for all components and utilities
- Follow Next.js App Router conventions
- Use shadcn/ui components for consistent UI
- Implement proper error handling and loading states
- Use Prisma for all database operations
- Follow React best practices with hooks and functional components

## Key Features to Implement
1. **Microblogging Feed**: Twitter-like posts for class discussions
2. **Class Rating System**: 1-5 star rating with reviews
3. **Review Management**: CRUD operations for class reviews
4. **Exercise To-Do**: Optional task management for classes
5. **Database Sync**: Real-time data persistence with Prisma

## Component Structure
- Use `src/components/ui/` for reusable UI components
- Create feature-specific components in `src/components/`
- Follow atomic design principles
- Implement proper prop types with TypeScript interfaces
