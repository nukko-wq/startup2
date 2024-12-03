import { NextResponse } from 'next/server'

export async function GET() {
	const extensionIdsStr = process.env.EXTENSION_ID
	if (!extensionIdsStr) {
		return new NextResponse('Extension IDs not configured', { status: 500 })
	}

	// カンマ区切りの文字列を配列に変換
	const extensionIds = extensionIdsStr.split(',').map((id) => id.trim())

	return NextResponse.json({ extensionIds })
}
