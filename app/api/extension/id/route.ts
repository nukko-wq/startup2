import { NextResponse } from 'next/server'

export async function GET() {
	// この値は環境変数から取得するのがベストプラクティスです
	const extensionId = process.env.EXTENSION_ID

	return NextResponse.json({ extensionId })
}
