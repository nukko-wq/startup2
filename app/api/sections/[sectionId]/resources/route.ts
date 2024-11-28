import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(
	request: Request,
	{ params }: { params: { sectionId: string } },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const { sectionId } = params

		const resources = await prisma.resource.findMany({
			where: {
				sectionId,
				userId: user.id,
			},
			orderBy: {
				order: 'asc',
			},
		})

		return NextResponse.json(resources)
	} catch (error) {
		console.error(error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
