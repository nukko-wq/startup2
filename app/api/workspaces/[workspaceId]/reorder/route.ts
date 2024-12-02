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

		const updatedWorkspace = await prisma.$transaction(async (tx) => {
			// 移動対象のワークスペースの現在の順序を取得
			const currentWorkspace = await tx.workspace.findFirst({
				where: {
					id: workspaceId,
					userId: user.id,
				},
			})

			if (!currentWorkspace) {
				throw new Error('Workspace not found')
			}

			const currentOrder = currentWorkspace.order

			if (currentOrder < order) {
				// 下に移動する場合
				await tx.workspace.updateMany({
					where: {
						userId: user.id,
						isDefault: false,
						order: {
							gt: currentOrder,
							lte: order,
						},
					},
					data: {
						order: {
							decrement: 1,
						},
					},
				})
			} else {
				// 上に移動する場合
				await tx.workspace.updateMany({
					where: {
						userId: user.id,
						isDefault: false,
						order: {
							gte: order,
							lt: currentOrder,
						},
					},
					data: {
						order: {
							increment: 1,
						},
					},
				})
			}

			// 対象のワークスペースを新しい位置に移動
			const updated = await tx.workspace.update({
				where: {
					id: workspaceId,
					userId: user.id,
				},
				data: {
					order,
				},
			})

			// 全ての非デフォルトワークスペースを取得して順序を正規化
			const workspaces = await tx.workspace.findMany({
				where: {
					userId: user.id,
					isDefault: false,
				},
				orderBy: {
					order: 'asc',
				},
			})

			// orderを1から連番で振り直す
			for (let i = 0; i < workspaces.length; i++) {
				if (workspaces[i].order !== i + 1) {
					await tx.workspace.update({
						where: {
							id: workspaces[i].id,
						},
						data: {
							order: i + 1,
						},
					})
				}
			}

			return updated
		})

		return NextResponse.json(updatedWorkspace)
	} catch (error) {
		console.error('Error reordering workspace:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
