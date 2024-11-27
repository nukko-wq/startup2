import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ workspaceId: string; spaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { workspaceId, spaceId } = resolvedParams
		const { name } = await request.json()

		const space = await prisma.space.update({
			where: {
				id: spaceId,
				workspaceId,
				userId: user.id,
			},
			data: { name },
		})

		return NextResponse.json(space)
	} catch (error) {
		return new NextResponse('Internal Error', { status: 500 })
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ workspaceId: string; spaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { workspaceId, spaceId } = resolvedParams

		const deletedSpace = await prisma.space.delete({
			where: {
				id: spaceId,
				workspaceId,
				userId: user.id,
			},
		})

		return NextResponse.json({ spaceId, workspaceId })
	} catch (error) {
		console.error('Error deleting space:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
