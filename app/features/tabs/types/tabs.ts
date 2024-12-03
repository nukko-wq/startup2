export interface Tab {
	id: number
	title: string
	url: string
	faviconUrl?: string
	pinned: boolean
}

export interface TabsState {
	tabs: Tab[]
	loading: boolean
	error: string | null
}

export interface ExtensionMessage {
	type:
		| 'SWITCH_TO_TAB'
		| 'CLOSE_TAB'
		| 'CLOSE_ALL_TABS'
		| 'SORT_TABS_BY_DOMAIN'
		| 'FIND_TAB'
		| 'CREATE_TAB'
		| 'REQUEST_TABS_UPDATE'
	tabId?: number
	url?: string
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

export interface ExtensionResponse {
	tabId?: number
	success?: boolean
	error?: string
}
