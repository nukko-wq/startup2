import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Tab, ExtensionMessage, ExtensionResponse } from './types'

interface TabsState {
	tabs: Tab[]
	loading: boolean
	error: string | null
}

const initialState: TabsState = {
	tabs: [],
	loading: false,
	error: null,
}

// 拡張機能との通信を行う関数
export const sendMessageToExtension = async (
	message: ExtensionMessage,
): Promise<ExtensionResponse> => {
	try {
		// ローカルストレージから拡張機能のIDを取得
		const response = await fetch('http://localhost:3000/api/extension/id')
		const { extensionId } = await response.json()

		// 拡張機能にメッセージを送信
		const result = await chrome.runtime.sendMessage(extensionId, message)
		return result
	} catch (error) {
		console.error('Error sending message to extension:', error)
		throw error
	}
}

// タブを閉じる関数
export const closeTab = async (tabId: number) => {
	try {
		await sendMessageToExtension({
			type: 'CLOSE_TAB',
			tabId: tabId,
		})
	} catch (error) {
		console.error('Error closing tab:', error)
	}
}

// すべてのタブを閉じる関数
export const closeAllTabs = async () => {
	try {
		await sendMessageToExtension({
			type: 'CLOSE_ALL_TABS',
		})
	} catch (error) {
		console.error('Error closing all tabs:', error)
	}
}

// URLからドメインを取得するヘルパー関数
const getDomain = (url: string) => {
	try {
		const urlObj = new URL(url)
		return urlObj.hostname
	} catch (error) {
		return url
	}
}

// タブをドメインでソートする関数
export const sortTabsByDomain = async () => {
	try {
		// 現在のタブを取得してソート
		const response = await fetch('http://localhost:3000/api/extension/id')
		const { extensionId } = await response.json()

		await sendMessageToExtension({
			type: 'SORT_TABS_BY_DOMAIN',
		})
	} catch (error) {
		console.error('Error sorting tabs by domain:', error)
	}
}

const tabsSlice = createSlice({
	name: 'tabs',
	initialState,
	reducers: {
		setTabs: (state, action: PayloadAction<Tab[]>) => {
			state.tabs = action.payload
			state.loading = false
			state.error = null
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload
		},
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload
			state.loading = false
		},
	},
})

export const { setTabs, setLoading, setError } = tabsSlice.actions
export default tabsSlice.reducer
