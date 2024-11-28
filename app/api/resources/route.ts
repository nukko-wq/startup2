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
		const { title, url, sectionId, faviconUrl } = json

		const section = await prisma.section.findUnique({
			where: { id: sectionId },
		})

		if (!section) {
			return new NextResponse('Section not found', { status: 404 })
		}

		// 最後のorder値を取得
		const lastResource = await prisma.resource.findFirst({
			where: { sectionId },
			orderBy: { order: 'desc' },
		})

		const newOrder = lastResource ? lastResource.order + 1 : 0

		const resource = await prisma.resource.create({
			data: {
				title,
				url,
				faviconUrl,
				order: newOrder,
				userId: user.id,
				sectionId,
			},
		})

		return NextResponse.json(resource)
	} catch (error) {
		console.error(error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
