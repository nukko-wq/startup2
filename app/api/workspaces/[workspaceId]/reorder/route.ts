import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

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
		const { order } = await request.json()

		// トランザクションを使用して並び順を更新
		const updatedWorkspace = await prisma.$transaction(async (tx) => {
			// 現在のワークスペースより大きい順序のワークスペースを1つずつ後ろにずらす
			await tx.workspace.updateMany({
				where: {
					userId: user.id,
					order: {
						gte: order,
					},
				},
				data: {
					order: {
						increment: 1,
					},
				},
			})

			// 対象のワークスペースを新しい位置に移動
			return tx.workspace.update({
				where: {
					id: workspaceId,
					userId: user.id,
				},
				data: {
					order,
				},
			})
		})

		return NextResponse.json(updatedWorkspace)
	} catch (error) {
		console.error('Error reordering workspace:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
