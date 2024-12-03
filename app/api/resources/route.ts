import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const json = await request.json()

		const {
			title,
			url,
			sectionId,
			faviconUrl,
			mimeType,
			description,
			isGoogleDrive,
			order,
		} = json

		const section = await prisma.section.findUnique({
			where: { id: sectionId },
		})

		if (!section) {
			return new NextResponse('Section not found', { status: 404 })
		}

		// 既存のリソースを取得
		const existingResources = await prisma.resource.findMany({
			where: { sectionId },
			orderBy: { order: 'asc' },
		})

		// トランザクションで新規作成と順序の更新を行う
		const result = await prisma.$transaction(async (tx) => {
			// 既存のリソースの順序を更新
			if (typeof order === 'number') {
				await tx.resource.updateMany({
					where: {
						sectionId,
						order: {
							gte: order, // 新しいリソースのorder以上のリソースを対象
						},
					},
					data: {
						order: {
							increment: 1, // orderを1つずつ増やす
						},
					},
				})
			}

			// 新しいリソースを作成
			const resource = await tx.resource.create({
				data: {
					title,
					url,
					faviconUrl,
					mimeType,
					description,
					isGoogleDrive,
					order:
						order !== undefined
							? order
							: existingResources.length > 0
								? existingResources[existingResources.length - 1].order + 1
								: 0,
					userId: user.id,
					sectionId,
				},
			})

			return resource
		})

		return NextResponse.json(result)
	} catch (error) {
		console.error('Error creating resource:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
