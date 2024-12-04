'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function ExtensionConnector() {
	const { data: session } = useSession()

	useEffect(() => {
		const sendTokenToExtension = async () => {
			if (session?.accessToken) {
				try {
					// 拡張機能のIDを取得
					const response = await fetch('/api/extension/id')
					const { extensionId } = await response.json()

					if (!extensionId) {
						console.error('Extension ID not found')
						return
					}

					// トークンを拡張機能に送信
					await chrome.runtime.sendMessage(extensionId, {
						type: 'SET_TOKEN',
						token: session.accessToken,
					})
					console.log('Token sent to extension')
				} catch (error) {
					console.error('Failed to send token to extension:', error)
				}
			}
		}

		sendTokenToExtension()
	}, [session])

	return null
}
