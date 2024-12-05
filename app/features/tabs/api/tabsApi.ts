import type {
	ExtensionMessage,
	ExtensionResponse,
} from '@/app/features/tabs/types/tabs'

export const tabsApi = {
	sendMessageToExtension: async (
		message: ExtensionMessage,
	): Promise<ExtensionResponse> => {
		if (!window.chrome?.runtime) {
			return { success: false, error: 'Extension not installed' }
		}

		try {
			const apiUrl =
				process.env.NODE_ENV === 'development'
					? 'http://localhost:3000/api/extension/id'
					: 'https://startup.nukko.dev/api/extension/id'

			const response = await fetch(apiUrl)
			const { extensionIds } = await response.json()

			if (!extensionIds || extensionIds.length === 0) {
				throw new Error('Extension IDs not found')
			}

			return new Promise<ExtensionResponse>((resolve, reject) => {
				const handleResponse = (event: MessageEvent) => {
					if (event.data.source === 'startup-extension') {
						window.removeEventListener('message', handleResponse)
						if (event.data.success) {
							resolve(event.data)
						} else {
							reject(new Error(event.data.error))
						}
					}
				}

				window.addEventListener('message', handleResponse)

				const timeoutId = setTimeout(() => {
					window.removeEventListener('message', handleResponse)
					reject(new Error('Message timeout'))
				}, 5000)

				for (const extensionId of extensionIds) {
					window.postMessage(
						{
							...message,
							extensionId,
							source: 'webapp',
						},
						'*',
					)
				}
			})
		} catch (error) {
			console.error('Error sending message to extension:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		}
	},

	closeTab: async (tabId: number) => {
		try {
			const result = await tabsApi.sendMessageToExtension({
				type: 'CLOSE_TAB',
				tabId: tabId,
			})
			if (!result.success) {
				console.debug('Failed to close tab:', result.error)
			}
		} catch (error) {
			console.debug('Error closing tab:', error)
		}
	},

	closeAllTabs: async () => {
		try {
			await tabsApi.sendMessageToExtension({
				type: 'CLOSE_ALL_TABS',
			})
		} catch (error) {
			console.error('Error closing all tabs:', error)
		}
	},

	sortTabsByDomain: async () => {
		try {
			await tabsApi.sendMessageToExtension({
				type: 'SORT_TABS_BY_DOMAIN',
			})
		} catch (error) {
			console.error('Error sorting tabs by domain:', error)
		}
	},
}
