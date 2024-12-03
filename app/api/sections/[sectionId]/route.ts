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

		const result = await prisma.$transaction(async (tx) => {
			// 削除対象のセクションを取得
			const targetSection = await tx.section.findUnique({
				where: { id: sectionId },
			})

			if (!targetSection) {
				throw new Error('Section not found')
			}

			// セクションを削除
			const deletedSection = await tx.section.delete({
				where: {
					id: sectionId,
					userId: user.id,
				},
			})

			// 同じスペース内の、削除したセクションより大きいorderを持つセクションのorderを1つずつ減らす
			await tx.section.updateMany({
				where: {
					spaceId: targetSection.spaceId,
					order: {
						gt: targetSection.order,
					},
				},
				data: {
					order: {
						decrement: 1,
					},
				},
			})

			// 更新後のセクション一覧を取得
			const updatedSections = await tx.section.findMany({
				where: { spaceId: targetSection.spaceId },
				orderBy: { order: 'asc' },
			})

			return {
				deletedSection,
				updatedSections,
				spaceId: targetSection.spaceId,
			}
		})

		return NextResponse.json(result)
	} catch (error) {
		console.error('Error deleting section:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}

export async function PATCH(
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
		const { name } = await request.json()

		const section = await prisma.section.update({
			where: { id: sectionId },
			data: { name },
		})

		return NextResponse.json(section)
	} catch (error) {
		console.error('Error updating section:', error)
		return new NextResponse('Internal Error', { status: 500 })
	}
}
