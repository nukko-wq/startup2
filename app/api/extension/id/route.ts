import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const extensionIdsStr = process.env.EXTENSION_ID
		if (!extensionIdsStr) {
			console.error('EXTENSION_ID environment variable is not set')
			return new NextResponse('Extension IDs not configured', { status: 500 })
		}

		// 現在の拡張機能IDを確認
		const extensionIds = extensionIdsStr
			.split(',')
			.map((id) => id.trim())
			.filter((id) => id.length > 0)

		if (extensionIds.length === 0) {
			console.error('No valid extension IDs found')
			return new NextResponse('No valid extension IDs', { status: 500 })
		}

		console.log('Available extension IDs:', extensionIds)
		return NextResponse.json({ extensionIds })
	} catch (error) {
		console.error('Error in extension ID route:', error)
		return new NextResponse('Internal server error', { status: 500 })
	}
}
