const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('Clearing database...')
    
    // Delete in correct order to avoid foreign key constraints
    await prisma.lectureReview.deleteMany()
    await prisma.lecture.deleteMany()
    await prisma.classReview.deleteMany()
    await prisma.exercise.deleteMany()
    await prisma.post.deleteMany()
    await prisma.class.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('Database cleared successfully!')
  } catch (error) {
    console.error('Error clearing database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearDatabase()
