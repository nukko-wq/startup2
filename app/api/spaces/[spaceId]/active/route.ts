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
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const spaceId = resolvedParams.spaceId

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
					workspace: true, // ワークスペース情報も含める
				},
			})
		})

		return NextResponse.json(updatedSpace)
	} catch (error) {
		console.error('Error updating active space:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
