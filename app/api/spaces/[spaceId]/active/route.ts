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

		// 現在のアクティブスペースをリセット
		await prisma.space.updateMany({
			where: {
				userId: user.id,
				isLastActive: true,
			},
			data: {
				isLastActive: false,
			},
		})

		// 新しいアクティブスペースを設定
		const updatedSpace = await prisma.space.update({
			where: {
				id: spaceId,
				userId: user.id,
			},
			data: {
				isLastActive: true,
			},
		})

		return NextResponse.json(updatedSpace)
	} catch (error) {
		console.error('Error updating active space:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
