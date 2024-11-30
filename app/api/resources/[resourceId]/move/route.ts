import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const resolvedParams = await params
		const { resourceId } = resolvedParams
		const { sectionId, order } = await request.json()

		const updatedResource = await prisma.resource.update({
			where: {
				id: resourceId,
			},
			data: {
				sectionId,
				order,
			},
		})

		return NextResponse.json({
			...updatedResource,
			targetSectionId: sectionId,
		})
	} catch (error) {
		console.error('Failed to move resource:', error)
		return NextResponse.json(
			{ error: 'リソースの移動に失敗しました' },
			{ status: 500 },
		)
	}
}
