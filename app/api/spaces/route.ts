import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET(request: NextRequest) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const spaces = await prisma.space.findMany({
			where: {
				userId: user.id,
			},
			orderBy: [
				{
					workspaceId: 'asc',
				},
				{
					order: 'asc',
				},
			],
		})

		return NextResponse.json(spaces)
	} catch (error) {
		console.error('Error fetching all spaces:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
