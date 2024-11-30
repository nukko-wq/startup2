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
		const { order, allOrders } = await request.json()

		// トランザクションで一括更新
		const updatedSpaces = await prisma.$transaction(async (tx) => {
			// 全ての順序を更新
			for (const orderUpdate of allOrders) {
				await tx.space.update({
					where: {
						id: orderUpdate.spaceId,
						workspaceId,
						userId: user.id,
					},
					data: {
						order: orderUpdate.newOrder,
					},
				})
			}

			// 更新後のスペース一覧を取得
			return tx.space.findMany({
				where: {
					workspaceId,
					userId: user.id,
				},
				orderBy: {
					order: 'asc',
				},
			})
		})

		return NextResponse.json({ updatedSpaces })
	} catch (error) {
		console.error('Error reordering space:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
