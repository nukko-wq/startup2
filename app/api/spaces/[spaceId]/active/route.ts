import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ spaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
		}

		const resolvedParams = await params
		const { spaceId } = resolvedParams

		if (!spaceId) {
			return NextResponse.json(
				{ message: 'スペースIDが必要です' },
				{ status: 400 },
			)
		}

		// まず対象のスペースが存在し、ユーザーがアクセス権を持っているか確認
		const targetSpace = await prisma.space.findFirst({
			where: {
				id: spaceId,
				userId: user.id,
			},
		})

		if (!targetSpace) {
			return NextResponse.json(
				{ message: '指定されたスペースが見つかりません' },
				{ status: 404 },
			)
		}

		// トランザクションを使用して一連の操作を実行
		const updatedSpace = await prisma.$transaction(async (tx) => {
			// 現在のアクティブスペースをリセット
			await tx.space.updateMany({
				where: {
					userId: user.id,
					isLastActive: true,
				},
				data: {
					isLastActive: false,
				},
			})

			// 新しいアクティブスペースを設定
			return await tx.space.update({
				where: {
					id: spaceId,
					userId: user.id,
				},
				data: {
					isLastActive: true,
					updatedAt: new Date(),
				},
			})
		})

		return NextResponse.json(updatedSpace)
	} catch (error) {
		console.error('Error updating active space:', {
			error: error instanceof Error ? error.message : 'Unknown error',
		})

		return NextResponse.json(
			{
				message: 'アクティブスペースの設定に失敗しました',
				details: error instanceof Error ? error.message : undefined,
			},
			{ status: 500 },
		)
	}
}
