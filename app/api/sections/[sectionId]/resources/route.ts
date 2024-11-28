import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ sectionId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { sectionId } = resolvedParams

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
