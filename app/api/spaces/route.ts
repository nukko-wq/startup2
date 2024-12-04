import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET() {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		console.log('Fetching all spaces for user:', user.id)

		// ユーザーの全てのスペースを取得
		const spaces = await prisma.space.findMany({
			where: {
				userId: user.id,
			},
			orderBy: [
				{
					workspaceId: 'asc',
				},
				{
					order: 'asc',
				},
			],
			include: {
				workspace: {
					select: {
						name: true,
					},
				},
			},
		})

		console.log('Found spaces:', spaces)

		// クライアントに必要な形式に整形
		const formattedSpaces = spaces.map((space) => ({
			id: space.id,
			name: space.name,
			workspaceName: space.workspace.name,
			order: space.order,
		}))

		return NextResponse.json(formattedSpaces)
	} catch (error) {
		console.error('Error fetching spaces:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
