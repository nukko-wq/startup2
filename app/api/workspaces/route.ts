import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const workspaces = await prisma.workspace.findMany({
			where: { userId: user.id },
			orderBy: { order: 'asc' },
		})

		return NextResponse.json(workspaces)
	} catch (error) {
		return new NextResponse('Internal Error', { status: 500 })
	}
}

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const { name } = await request.json()

		const maxOrder = await prisma.workspace.findFirst({
			where: { userId: user.id },
			orderBy: { order: 'desc' },
			select: { order: true },
		})

		const workspace = await prisma.workspace.create({
			data: {
				name,
				userId: user.id,
				order: maxOrder ? maxOrder.order + 1 : 0,
			},
		})

		return NextResponse.json(workspace)
	} catch (error) {
		return new NextResponse('Internal Error', { status: 500 })
	}
}
