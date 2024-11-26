import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'

const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') ?? []

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(db),
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID ?? '',
			clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
		}),
	],
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/login',
		error: '/error',
	},
	callbacks: {
		async signIn({ user, account, profile }) {
			console.log('Sign in callback: ', user)
			console.log('Allowed emails:', allowedEmails)
			console.log('User email:', user.email)

			if (!allowedEmails.includes(user.email ?? '')) {
				console.log('Email not allowed')
				return false
			}
			try {
				if (!account || !user.email) {
					console.error('Invalid account or user email')
					return false
				}

				const existingUser = await db.user.findUnique({
					where: { email: user.email },
				})
				if (!existingUser) {
					await db.user.create({
						data: {
							email: user.email,
							name: user.name,
							accounts: {
								create: {
									type: account.type ?? 'oauth',
									provider: 'google',
									providerAccountId: account.providerAccountId,
									access_token: account.access_token,
									token_type: account.token_type,
									refresh_token: account.refresh_token,
									expires_at: account.expires_at,
									scope: account.scope,
									id_token: account.id_token,
								},
							},
						},
					})
				}
				return true
			} catch (error) {
				console.error('Error in signIn callback:', error)
				return false
			}
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string
				session.accessToken = token.accessToken as string
				session.refreshToken = token.refreshToken as string
				session.expiresAt = token.expiresAt as number
			}
			return session
		},
		async jwt({ token, account, user }) {
			if (account && user && user.id) {
				token.id = user.id
				token.accessToken = account.access_token
				token.refreshToken = account.refresh_token
				token.expires_at = account.expires_at
			}
			return token
		},
	},
})
