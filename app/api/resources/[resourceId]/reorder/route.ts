import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const resolvedParams = await params
		const { resourceId } = resolvedParams
		const { order } = await request.json()

		const updatedResource = await prisma.resource.update({
			where: {
				id: resourceId,
			},
			data: {
				order,
			},
		})

		return NextResponse.json(updatedResource)
	} catch (error) {
		console.error('Failed to reorder resource:', error)
		return NextResponse.json(
			{ error: 'リソースの並び替えに失敗しました' },
			{ status: 500 },
		)
	}
}
