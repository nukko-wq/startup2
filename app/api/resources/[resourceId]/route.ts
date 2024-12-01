import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { resourceId } = resolvedParams

		const resource = await prisma.resource.delete({
			where: {
				id: resourceId,
				userId: user.id,
			},
		})

		return NextResponse.json(resource)
	} catch (error) {
		console.error(error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ resourceId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const json = await request.json()
		const { title, url, description } = json

		const resolvedParams = await params
		const { resourceId } = resolvedParams

		const resource = await prisma.resource.update({
			where: {
				id: resourceId,
				userId: user.id,
			},
			data: {
				title,
				url,
				description,
			},
		})

		return NextResponse.json(resource)
	} catch (error) {
		console.error(error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
