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

			return new Promise((resolve) => {
				const messageHandler = (event: MessageEvent) => {
					if (event.data.source === 'startup-extension') {
						window.removeEventListener('message', messageHandler)
						resolve(event.data)
					}
				}

				window.addEventListener('message', messageHandler)

				for (const extensionId of extensionIds) {
					try {
						window.postMessage(
							{
								...message,
								extensionId,
								source: 'webapp',
							} as ExtensionMessage,
							'*',
						)
					} catch (error) {
						console.error(
							`Failed to send message to extension ${extensionId}:`,
							error,
						)
					}
				}

				setTimeout(() => {
					window.removeEventListener('message', messageHandler)
					resolve({
						success: false,
						error: 'Timeout waiting for extension response',
					})
				}, 5000)
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
			const result = await tabsApi.sendMessageToExtension({
				type: 'CLOSE_ALL_TABS',
			})
			if (!result.success) {
				throw new Error(result.error || 'Failed to close all tabs')
			}
			// タブを閉じた後、更新をリクエスト
			return await tabsApi.sendMessageToExtension({
				type: 'REQUEST_TABS_UPDATE',
			})
		} catch (error) {
			console.error('Error closing all tabs:', error)
			throw error
		}
	},

	sortTabsByDomain: async () => {
		try {
			const result = await tabsApi.sendMessageToExtension({
				type: 'SORT_TABS_BY_DOMAIN',
			})
			if (!result.success) {
				throw new Error(result.error || 'Failed to sort tabs')
			}
			// 並び替え後、タブリストの更新をリクエスト
			return await tabsApi.sendMessageToExtension({
				type: 'REQUEST_TABS_UPDATE',
			})
		} catch (error) {
			console.error('Error sorting tabs by domain:', error)
			throw error
		}
	},
}
