import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') ?? []

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID ?? '',
			clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
		}),
	],
	pages: {
		signIn: '/login',
		error: '/error',
	},
	callbacks: {
		async signIn({ user }) {
			console.log('Sign in callback: ', user)
			console.log('Allowed emails:', allowedEmails)
			console.log('User email:', user.email)

			if (!allowedEmails.includes(user.email ?? '')) {
				console.log('Email not allowed')
				return false
			}
			return true
		},
	},
})
