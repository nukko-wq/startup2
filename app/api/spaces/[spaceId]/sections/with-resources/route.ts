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

		// セクションとリソースを一度のクエリで取得
		const sectionsWithResources = await prisma.section.findMany({
			where: {
				spaceId,
				space: {
					userId: user.id,
				},
			},
			include: {
				resources: {
					orderBy: {
						order: 'asc',
					},
				},
			},
			orderBy: {
				order: 'asc',
			},
		})

		// レスポンスの形式を整形
		const formattedResponse = {
			sections: sectionsWithResources.map(
				({ resources, ...sectionData }) => sectionData,
			),
			resources: sectionsWithResources.reduce<{
				[key: string]: (typeof sectionsWithResources)[number]['resources']
			}>((acc, section) => {
				acc[section.id] = section.resources
				return acc
			}, {}),
		}

		return NextResponse.json(formattedResponse)
	} catch (error) {
		console.error('Error fetching sections with resources:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
