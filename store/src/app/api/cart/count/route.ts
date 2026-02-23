import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ count: 0 })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: true,
      },
    })

    return NextResponse.json({ count: cart?.items.length || 0 })
  } catch (error) {
    console.error('Error getting cart count:', error)
    return NextResponse.json({ count: 0 })
  }
} 