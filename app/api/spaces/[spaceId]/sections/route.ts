import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET(
	req: NextRequest,
	context: { params: Promise<{ spaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const { spaceId } = await context.params

		const sections = await prisma.section.findMany({
			where: {
				spaceId,
				space: {
					userId: user.id,
				},
			},
			orderBy: {
				order: 'asc',
			},
		})

		return NextResponse.json(sections)
	} catch (error) {
		console.error('Error fetching sections:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}

export async function POST(
	req: NextRequest,
	context: { params: Promise<{ spaceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const { spaceId } = await context.params
		const { name } = await req.json()

		// スペースの存在と所有権を確認
		const space = await prisma.space.findUnique({
			where: {
				id: spaceId,
				userId: user.id,
			},
		})

		if (!space) {
			return new NextResponse('Space not found', { status: 404 })
		}

		// 現在の最大orderを取得
		const maxOrder = await prisma.section.findFirst({
			where: { spaceId },
			orderBy: { order: 'desc' },
			select: { order: true },
		})

		// 新しいセクションを作成
		const newSection = await prisma.section.create({
			data: {
				name,
				spaceId,
				userId: user.id,
				order: maxOrder ? maxOrder.order + 1 : 0,
			},
		})

		return NextResponse.json(newSection)
	} catch (error) {
		console.error('Error creating section:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
