import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('id')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Delete related data first
    const lectures = await (prisma as any).lecture.findMany({
      where: { classId: classId }
    })

    for (const lecture of lectures) {
      await (prisma as any).lectureReview.deleteMany({
        where: { lectureId: lecture.id }
      })
    }

    await (prisma as any).lecture.deleteMany({
      where: { classId: classId }
    })

    await (prisma as any).classReview.deleteMany({
      where: { classId: classId }
    })

    // Delete the class
    await prisma.class.delete({
      where: { id: classId }
    })

    return NextResponse.json({ message: 'Class deleted successfully' })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  }
}
