'use client'

import { Button } from 'react-aria-components'
import IconGoogle from '@/app/components/elements/IconGoogle'
import { useFormStatus } from 'react-dom'

const SignInButton = () => {
	const { pending } = useFormStatus()

	return (
		<Button
			className="flex flex-grow items-center w-[350px] p-4 justify-center hover:bg-gray-100 outline-none disabled:opacity-50"
			type="submit"
			isDisabled={pending}
		>
			<IconGoogle className="mr-2" />
			Google
		</Button>
	)
}

export default SignInButton
