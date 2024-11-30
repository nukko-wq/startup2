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
		const { spaceId } = resolvedParams
		const { targetWorkspaceId, order } = await request.json()

		const movedSpace = await prisma.space.update({
			where: {
				id: spaceId,
				userId: user.id,
			},
			data: {
				workspaceId: targetWorkspaceId,
				order,
			},
		})

		return NextResponse.json({
			movedSpace,
			sourceWorkspaceId: resolvedParams.workspaceId,
			targetWorkspaceId,
		})
	} catch (error) {
		console.error('Error moving space:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
