import type {
	ExtensionMessage,
	ExtensionResponse,
} from '@/app/features/tabs/types/tabs'

export const tabsApi = {
	sendMessageToExtension: async (
		message: ExtensionMessage,
	): Promise<ExtensionResponse> => {
		// 拡張機能が存在しない場合は静かに失敗
		if (!window.chrome?.runtime) {
			return { success: false, error: 'Extension not installed' }
		}

		try {
			// ローカルストレージから拡張機能のIDを取得
			const response = await fetch('http://localhost:3000/api/extension/id')
			const { extensionId } = await response.json()

			// 拡張機能にメッセージを送信
			const result = await chrome.runtime.sendMessage(extensionId, message)
			return result
		} catch (error) {
			// エラーをスローせずに結果を返す
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
