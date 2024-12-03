import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getGoogleAuth } from '@/lib/google'
import type { GoogleDriveApiError } from '@/app/features/google-drive/types/googleDrive'

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const query = searchParams.get('q') || ''

		const session = await auth()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 })
		}

		try {
			const auth = await getGoogleAuth(session)
			if (!auth) {
				return NextResponse.json(
					{ error: 'Google認証が必要です' },
					{ status: 401 },
				)
			}

			const drive = google.drive({ version: 'v3', auth })

			const searchQuery = query
				? `name contains '${query}' and mimeType != 'application/vnd.google-apps.folder' and trashed = false`
				: "mimeType != 'application/vnd.google-apps.folder' and trashed = false"

			const pageSize = query ? 100 : 10

			const response = await drive.files.list({
				pageSize,
				orderBy: 'viewedByMeTime desc',
				fields: 'files(id, name, webViewLink, mimeType)',
				q: searchQuery,
				spaces: 'drive',
			})

			return NextResponse.json({ files: response.data.files || [] })
		} catch (error) {
			console.error('Google Drive API error:', error)
			const apiError = error as GoogleDriveApiError

			if (apiError.code === 401 || apiError.status === 401) {
				return NextResponse.json(
					{ error: '認証の有効期限が切れました。再度ログインしてください。' },
					{ status: 401 },
				)
			}

			if (apiError.code === 403 || apiError.status === 403) {
				return NextResponse.json(
					{ error: 'Google Driveへのアクセス権限が不足しています。' },
					{ status: 403 },
				)
			}

			return NextResponse.json(
				{ error: 'Google Driveへのアクセスに失敗しました' },
				{ status: 500 },
			)
		}
	} catch (error) {
		console.error('Server error:', error)
		return NextResponse.json(
			{ error: 'サーバーエラーが発生しました' },
			{ status: 500 },
		)
	}
}
