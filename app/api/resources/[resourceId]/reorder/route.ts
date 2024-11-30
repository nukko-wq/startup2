import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface OrderUpdate {
	resourceId: string
	newOrder: number
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const { sectionId, order, allOrders } = (await request.json()) as {
			sectionId: string
			order: number
			allOrders: OrderUpdate[]
		}

		// トランザクションを使用して全てのリソースを一度に更新
		const updatedResources = await prisma.$transaction(
			allOrders.map(({ resourceId, newOrder }: OrderUpdate) =>
				prisma.resource.update({
					where: { id: resourceId },
					data: { order: newOrder },
				}),
			),
		)

		// 更新されたリソースを順序通りに並び替えて返す
		const sortedResources = updatedResources.sort((a, b) => a.order - b.order)

		return NextResponse.json({
			sectionId,
			updatedResources: sortedResources,
		})
	} catch (error) {
		console.error('Failed to reorder resources:', error)
		return NextResponse.json(
			{ error: 'リソースの並び替えに失敗しました' },
			{ status: 500 },
		)
	}
}
