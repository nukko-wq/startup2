import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function PUT(
	request: Request,
	context: { params: { spaceId: string } },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const { spaceId } = context.params

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
		return new NextResponse('Internal Error', { status: 500 })
	}
}
