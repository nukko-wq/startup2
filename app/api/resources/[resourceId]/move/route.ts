import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const resolvedParams = await params
		const { resourceId } = resolvedParams
		const { sectionId: targetSectionId, order } = await request.json()

		// 移動するリソースの現在のセクションを取得
		const currentResource = await prisma.resource.findUnique({
			where: { id: resourceId },
			select: { sectionId: true },
		})

		if (!currentResource) {
			throw new Error('Resource not found')
		}

		// トランザクションで両方のセクションのリソースを更新
		const result = await prisma.$transaction(async (tx) => {
			// 1. 移動するリソースを新しい位置に更新
			const movedResource = await tx.resource.update({
				where: { id: resourceId },
				data: {
					sectionId: targetSectionId,
					order,
				},
			})

			// 2. 移動先セクションの他のリソースのorderを更新
			const targetSectionResources = await tx.resource.findMany({
				where: {
					sectionId: targetSectionId,
					id: { not: resourceId },
				},
				orderBy: { order: 'asc' },
			})

			// 移動先での新しい順序を計算
			const updatedTargetOrders = targetSectionResources.map((res, index) => ({
				id: res.id,
				newOrder: index >= order ? index + 1 : index,
			}))

			// 移動先セクションの順序を更新
			for (const update of updatedTargetOrders) {
				await tx.resource.update({
					where: { id: update.id },
					data: { order: update.newOrder },
				})
			}

			// 3. 元のセクションのリソースの順序を詰める
			const sourceSectionResources = await tx.resource.findMany({
				where: {
					sectionId: currentResource.sectionId,
					id: { not: resourceId },
				},
				orderBy: { order: 'asc' },
			})

			// 元のセクションでの新しい順序を計算
			for (let i = 0; i < sourceSectionResources.length; i++) {
				await tx.resource.update({
					where: { id: sourceSectionResources[i].id },
					data: { order: i },
				})
			}

			return {
				movedResource,
				sourceSectionId: currentResource.sectionId,
				targetSectionId,
			}
		})

		return NextResponse.json(result)
	} catch (error) {
		console.error('Failed to move resource:', error)
		return NextResponse.json(
			{ error: 'リソースの移動に失敗しました' },
			{ status: 500 },
		)
	}
}
