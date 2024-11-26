import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET(
	request: Request,
	{ params }: { params: { workspaceId: string } },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const workspaceId = params.workspaceId

		console.log('Fetching spaces for workspace:', workspaceId)

		const spaces = await prisma.space.findMany({
			where: {
				workspaceId,
				userId: user.id,
			},
			orderBy: {
				order: 'asc',
			},
		})

		console.log('Found spaces:', spaces)

		return NextResponse.json(spaces)
	} catch (error) {
		console.error('Error fetching spaces:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
