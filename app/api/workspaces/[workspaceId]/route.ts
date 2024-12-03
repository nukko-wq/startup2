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

		const result = await prisma.$transaction(async (tx) => {
			// 削除対象のワークスペースを取得
			const targetWorkspace = await tx.workspace.findUnique({
				where: {
					id: workspaceId,
					userId: user.id,
				},
			})

			if (!targetWorkspace) {
				throw new Error('Workspace not found')
			}

			// ワークスペースを削除
			const deletedWorkspace = await tx.workspace.delete({
				where: {
					id: workspaceId,
					userId: user.id,
				},
			})

			// 同じユーザーの、削除したワークスペースより大きいorderを持つワークスペースのorderを1つずつ減らす
			await tx.workspace.updateMany({
				where: {
					userId: user.id,
					isDefault: false,
					order: {
						gt: targetWorkspace.order,
					},
				},
				data: {
					order: {
						decrement: 1,
					},
				},
			})

			// 更新後のワークスペース一覧を取得
			const updatedWorkspaces = await tx.workspace.findMany({
				where: {
					userId: user.id,
				},
				orderBy: { order: 'asc' },
			})

			return {
				deletedWorkspace,
				updatedWorkspaces,
			}
		})

		return NextResponse.json(result)
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
