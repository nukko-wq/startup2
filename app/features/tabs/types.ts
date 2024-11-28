export interface Tab {
	id?: number
	title: string
	url: string
	faviconUrl: string
}

export interface ExtensionMessage {
	type: 'SWITCH_TO_TAB'
	tabId: number
}
