import { NextResponse } from 'next/server'

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const url = searchParams.get('url')

	if (!url) {
		return NextResponse.json({ error: 'URLが必要です' }, { status: 400 })
	}

	try {
		const domain = new URL(url).origin
		const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}`
		return NextResponse.json({ faviconUrl: googleFaviconUrl })
	} catch (error) {
		return NextResponse.json(
			{ error: 'Faviconの取得に失敗しました' },
			{ status: 500 },
		)
	}
}
