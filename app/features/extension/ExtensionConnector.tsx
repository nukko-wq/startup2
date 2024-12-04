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
					if (!response.ok) {
						throw new Error(
							`Failed to fetch extension IDs: ${response.statusText}`,
						)
					}

					const { extensionIds } = await response.json()
					console.log('Retrieved extension IDs:', extensionIds)

					if (!extensionIds || extensionIds.length === 0) {
						console.error('No extension IDs available')
						return
					}

					for (const extensionId of extensionIds) {
						try {
							console.log('Attempting to send token to extension:', extensionId)
							const result = await chrome.runtime.sendMessage(extensionId, {
								type: 'SET_TOKEN',
								token: session.accessToken,
							})
							console.log(
								'Token sent successfully to extension:',
								extensionId,
								result,
							)
						} catch (error) {
							console.warn(
								`Failed to send token to extension ${extensionId}:`,
								error,
							)
						}
					}
				} catch (error) {
					console.error('Error in token sending process:', error)
				}
			} else {
				console.log('No access token available')
			}
		}

		sendTokenToExtension()
	}, [session?.accessToken])

	return null
}
