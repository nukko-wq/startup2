export interface Tab {
	id?: number
	title: string
	url: string
	faviconUrl: string
}

export interface ExtensionMessage {
	type: 'SWITCH_TO_TAB' | 'CLOSE_TAB' | 'CLOSE_ALL_TABS' | 'SORT_TABS_BY_DOMAIN'
	tabId?: number
	tabs?: Tab[]
}

export interface TabAction {
	tabId?: number
}

export interface SaveTabAction extends TabAction {
	title: string
	url: string
	faviconUrl?: string
	sectionId: string
}
