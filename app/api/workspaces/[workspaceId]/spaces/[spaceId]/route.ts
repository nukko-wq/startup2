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

		const result = await prisma.$transaction(async (tx) => {
			// 削除対象のスペースを取得
			const targetSpace = await tx.space.findUnique({
				where: { id: spaceId },
			})

			if (!targetSpace) {
				throw new Error('Space not found')
			}

			// スペースを削除
			const deletedSpace = await tx.space.delete({
				where: {
					id: spaceId,
					workspaceId,
					userId: user.id,
				},
			})

			// 同じワークスペース内の、削除したスペースより大きいorderを持つスペースのorderを1つずつ減らす
			await tx.space.updateMany({
				where: {
					workspaceId: targetSpace.workspaceId,
					order: {
						gt: targetSpace.order,
					},
				},
				data: {
					order: {
						decrement: 1,
					},
				},
			})

			// 更新後のスペース一覧を取得
			const updatedSpaces = await tx.space.findMany({
				where: { workspaceId: targetSpace.workspaceId },
				orderBy: { order: 'asc' },
			})

			return {
				deletedSpace,
				updatedSpaces,
				workspaceId: targetSpace.workspaceId,
			}
		})

		return NextResponse.json(result)
	} catch (error) {
		console.error('Error deleting space:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
