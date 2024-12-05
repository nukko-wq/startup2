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
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const resolvedParams = await params
		const spaceId = resolvedParams.spaceId
		const body = await request.json().catch(() => ({}))

		// トランザクションを使用して一貫性を保証
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

			// 新しいアクティブスペースを設定して返す
			return await tx.space.update({
				where: {
					id: spaceId,
					userId: user.id,
				},
				data: {
					isLastActive: true,
				},
				include: {
					workspace: true,
				},
			})
		})

		return NextResponse.json(
			{ success: true, space: updatedSpace },
			{
				headers: {
					'Cache-Control': 'no-store, no-cache, must-revalidate',
					Pragma: 'no-cache',
				},
			},
		)
	} catch (error) {
		console.error('Error updating active space:', error)
		return NextResponse.json(
			{
				error: 'Internal Server Error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}
