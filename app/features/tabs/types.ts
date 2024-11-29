export interface Tab {
	id?: number
	title: string
	url: string
	faviconUrl: string
}

export interface ExtensionMessage {
	type: 'SWITCH_TO_TAB' | 'CLOSE_TAB'
	tabId: number
}

export interface TabAction {
	tabId?: number
}
