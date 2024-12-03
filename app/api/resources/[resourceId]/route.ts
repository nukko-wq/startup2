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

		const result = await prisma.$transaction(async (tx) => {
			const targetResource = await tx.resource.findUnique({
				where: { id: resourceId },
			})

			if (!targetResource) {
				throw new Error('Resource not found')
			}

			const deletedResource = await tx.resource.delete({
				where: {
					id: resourceId,
					userId: user.id,
				},
			})

			await tx.resource.updateMany({
				where: {
					sectionId: targetResource.sectionId,
					order: {
						gt: targetResource.order,
					},
				},
				data: {
					order: {
						decrement: 1,
					},
				},
			})

			const updatedResources = await tx.resource.findMany({
				where: { sectionId: targetResource.sectionId },
				orderBy: { order: 'asc' },
			})

			return {
				deletedResource,
				updatedResources,
				sectionId: targetResource.sectionId,
			}
		})

		return NextResponse.json(result)
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
