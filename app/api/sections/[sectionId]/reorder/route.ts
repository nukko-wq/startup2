import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ sectionId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { sectionId } = resolvedParams
		const { order } = await request.json()

		// 対象のセクションを取得して権限チェック
		const targetSection = await prisma.section.findUnique({
			where: { id: sectionId },
			include: {
				space: {
					include: {
						workspace: true,
					},
				},
			},
		})

		if (!targetSection || targetSection.space.workspace.userId !== user.id) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		// トランザクションを使用して並び順を更新
		const updatedSection = await prisma.$transaction(async (tx) => {
			const currentSection = await tx.section.findUnique({
				where: { id: sectionId },
			})

			if (!currentSection) {
				throw new Error('Section not found')
			}

			const currentOrder = currentSection.order

			if (currentOrder < order) {
				// 下に移動する場合
				await tx.section.updateMany({
					where: {
						spaceId: targetSection.spaceId,
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
				await tx.section.updateMany({
					where: {
						spaceId: targetSection.spaceId,
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

			// 対象のセクションを新しい位置に移動
			return tx.section.update({
				where: { id: sectionId },
				data: { order },
			})
		})

		// 更新後の全セクションを取得して順序を正規化
		const allSections = await prisma.section.findMany({
			where: {
				spaceId: targetSection.spaceId,
			},
			orderBy: {
				order: 'asc',
			},
		})

		return NextResponse.json({
			section: updatedSection,
			spaceId: targetSection.spaceId,
			allSections,
		})
	} catch (error) {
		console.error('Error reordering section:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
