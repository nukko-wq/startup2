import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET(
	request: Request,
	context: { params: Promise<{ workspaceId: string }> },
) {
	try {
		const { workspaceId } = await context.params

		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

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

export async function POST(
	request: Request,
	context: { params: Promise<{ workspaceId: string }> },
) {
	try {
		const { workspaceId } = await context.params

		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const { name } = await request.json()

		// 最後のorderを取得
		const lastSpace = await prisma.space.findFirst({
			where: { workspaceId },
			orderBy: { order: 'desc' },
		})
		const newOrder = lastSpace ? lastSpace.order + 1 : 0

		const space = await prisma.space.create({
			data: {
				name,
				workspaceId,
				userId: user.id,
				order: newOrder,
			},
		})

		return NextResponse.json(space)
	} catch (error) {
		console.error('Error creating space:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
