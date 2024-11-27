import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

type Props = {
	params: {
		spaceId: string
	}
}

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
