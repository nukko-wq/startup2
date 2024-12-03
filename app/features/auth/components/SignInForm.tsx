'use client'

import { signIn } from 'next-auth/react'
import SignInButton from '@/app/features/auth/components/SignInButton'
import { useState } from 'react'
import { Form } from 'react-aria-components'

export default function SignInForm() {
	const [error, setError] = useState<string | null>(null)

	return (
		<div className="w-[350px] border border-border rounded-lg">
			<Form
				className="flex flex-col items-center"
				onSubmit={async (e) => {
					e.preventDefault()
					try {
						const result = await signIn('google', {
							callbackUrl: '/',
							redirect: true,
						})
						if (result?.error) {
							setError('ログインに失敗しました')
						}
					} catch (err) {
						setError('ログイン処理中にエラーが発生しました')
						console.error(err)
					}
				}}
			>
				<SignInButton />
				{error && <p className="text-red-500 mt-2">{error}</p>}
			</Form>
		</div>
	)
}
