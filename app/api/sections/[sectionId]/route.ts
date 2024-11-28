import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ sectionId: string }> },
) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const resolvedParams = await params
		const { sectionId } = resolvedParams

		const section = await prisma.section.delete({
			where: {
				id: sectionId,
				userId: user.id,
			},
		})

		return NextResponse.json({
			sectionId,
			spaceId: section.spaceId,
		})
	} catch (error) {
		console.error('Error deleting section:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
