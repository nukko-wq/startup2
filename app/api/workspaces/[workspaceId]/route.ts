import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ workspaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { workspaceId } = resolvedParams

		const workspace = await prisma.workspace.findUnique({
			where: {
				id: workspaceId,
				userId: user.id,
			},
		})

		if (!workspace) {
			return new NextResponse('Workspace not found', { status: 404 })
		}

		await prisma.workspace.delete({
			where: {
				id: workspaceId,
				userId: user.id,
			},
		})

		return new NextResponse(null, { status: 204 })
	} catch (error) {
		console.error('Error deleting workspace:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ workspaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { workspaceId } = resolvedParams
		const { name } = await request.json()

		const workspace = await prisma.workspace.update({
			where: {
				id: workspaceId,
				userId: user.id,
			},
			data: { name },
		})

		return NextResponse.json(workspace)
	} catch (error) {
		console.error('Error updating workspace:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
