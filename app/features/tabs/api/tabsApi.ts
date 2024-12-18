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

		return new Promise((resolve) => {
			const messageHandler = (event: MessageEvent) => {
				if (event.data.source === 'startup-extension') {
					window.removeEventListener('message', messageHandler)
					if (event.data.error === 'Extension context invalid') {
						console.warn(
							'Extension context invalid. Please reload the extension.',
						)
					}
					resolve(event.data)
				}
			}

			window.addEventListener('message', messageHandler)

			try {
				window.postMessage(
					{
						...message,
						source: 'webapp',
					} as ExtensionMessage,
					'*',
				)
			} catch (error) {
				resolve({
					success: false,
					error: 'Failed to send message to extension',
				})
			}

			setTimeout(() => {
				window.removeEventListener('message', messageHandler)
				resolve({
					success: false,
					error: 'Timeout waiting for extension response',
				})
			}, 5000)
		})
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
				const errorMessage = result.error || 'Failed to sort tabs'
				console.error('Sort tabs error:', errorMessage)
				throw new Error(errorMessage)
			}

			// 並び替え後、少し待ってからタブリストの更新をリクエスト
			await new Promise((resolve) => setTimeout(resolve, 1000))
			const updateResult = await tabsApi.sendMessageToExtension({
				type: 'REQUEST_TABS_UPDATE',
			})

			if (!updateResult.success) {
				throw new Error(
					updateResult.error || 'Failed to update tabs after sorting',
				)
			}

			return updateResult
		} catch (error) {
			console.error('Error sorting tabs by domain:', error)
			throw error
		}
	},

	findOrCreateStartupTab: async (): Promise<ExtensionResponse> => {
		return await tabsApi.sendMessageToExtension({
			type: 'FIND_OR_CREATE_STARTUP_TAB',
		})
	},

	showSpaceListOverlay: async (): Promise<ExtensionResponse> => {
		return await tabsApi.sendMessageToExtension({
			type: 'SHOW_SPACE_LIST_OVERLAY',
		})
	},
}
