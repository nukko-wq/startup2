import { google } from 'googleapis'
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function getGoogleAuth(session: Session | null) {
	if (!session?.user?.id) {
		throw new Error('ユーザーが見つかりません')
	}

	if (!session?.accessToken) {
		throw new Error('アクセストークンが見つかりません')
	}

	const oauth2Client = new google.auth.OAuth2(
		process.env.AUTH_GOOGLE_ID,
		process.env.AUTH_GOOGLE_SECRET,
	)

	oauth2Client.setCredentials({
		access_token: session.accessToken,
		refresh_token: session.refreshToken,
		expiry_date: session.expiresAt ? session.expiresAt * 1000 : undefined,
	})

	oauth2Client.on('tokens', async (tokens) => {
		if (tokens.access_token) {
			await prisma.account.update({
				where: {
					provider_providerAccountId: {
						provider: 'google',
						providerAccountId: session.user.id,
					},
				},
				data: {
					access_token: tokens.access_token,
					expires_at: Math.floor(Date.now() / 1000 + 3600),
				},
			})
		}
	})

	if (session.expiresAt && session.expiresAt * 1000 < Date.now()) {
		try {
			const { credentials } = await oauth2Client.refreshAccessToken()
			oauth2Client.setCredentials(credentials)
		} catch (error) {
			console.error('Failed to refresh token:', error)
			throw new Error('トークンの更新に失敗しました')
		}
	}

	return oauth2Client
}
