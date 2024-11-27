import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser()
		if (!user) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		// デフォルトワークスペースが既に存在するか確認
		const existingDefault = await prisma.workspace.findFirst({
			where: {
				userId: user.id,
				isDefault: true,
			},
		})

		if (existingDefault) {
			return NextResponse.json(existingDefault)
		}

		// デフォルトワークスペースを作成
		const workspace = await prisma.workspace.create({
			data: {
				name: 'Default Workspace',
				userId: user.id,
				order: 0,
				isDefault: true,
			},
		})

		return NextResponse.json(workspace)
	} catch (error) {
		return new NextResponse('Internal Error', { status: 500 })
	}
}
