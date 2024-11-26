import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function DELETE(
	request: Request,
	context: { params: { workspaceId: string; spaceId: string } },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const { workspaceId, spaceId } = await context.params

		// スペースの存在確認と所有権チェック
		const space = await prisma.space.findFirst({
			where: {
				id: spaceId,
				workspaceId,
				userId: user.id,
			},
		})

		if (!space) {
			return new NextResponse('Space not found', { status: 404 })
		}

		// スペースの削除
		await prisma.space.delete({
			where: {
				id: spaceId,
			},
		})

		// 空のオブジェクトを返す
		return new NextResponse(null, { status: 204 })
	} catch (error) {
		console.error('Error deleting space:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
