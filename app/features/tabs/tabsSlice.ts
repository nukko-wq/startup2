import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Tab, ExtensionMessage } from './types'

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
export const sendMessageToExtension = async (message: ExtensionMessage) => {
	try {
		// ローカルストレージから拡張機能のIDを取得
		const response = await fetch('http://localhost:3000/api/extension/id')
		const { extensionId } = await response.json()

		// 拡張機能にメッセージを送信
		await chrome.runtime.sendMessage(extensionId, message)
	} catch (error) {
		console.error('Error sending message to extension:', error)
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
