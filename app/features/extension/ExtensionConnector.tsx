'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function ExtensionConnector() {
	const { data: session } = useSession()

	useEffect(() => {
		const sendTokenToExtension = async () => {
			if (session?.accessToken) {
				try {
					const response = await fetch('/api/extension/id')
					const { extensionIds } = await response.json()

					if (!extensionIds || extensionIds.length === 0) {
						console.error('Extension IDs not found')
						return
					}

					console.log('Sending token to extensions:', extensionIds)

					for (const extensionId of extensionIds) {
						try {
							const result = await chrome.runtime.sendMessage(extensionId, {
								type: 'SET_TOKEN',
								token: session.accessToken,
							})
							console.log('Token sent successfully:', result)
						} catch (error) {
							console.error(
								`Failed to send token to extension ${extensionId}:`,
								error,
							)
						}
					}
				} catch (error) {
					console.error('Failed to send token to extension:', error)
				}
			} else {
				console.log('No access token available')
			}
		}

		sendTokenToExtension()
	}, [session?.accessToken])

	return null
}
