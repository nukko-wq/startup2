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

export type ExtensionMessageType =
	| 'SWITCH_TO_TAB'
	| 'CLOSE_TAB'
	| 'CLOSE_ALL_TABS'
	| 'SORT_TABS_BY_DOMAIN'
	| 'FIND_TAB'
	| 'CREATE_TAB'
	| 'REQUEST_TABS_UPDATE'
	| 'SET_TOKEN'
	| 'FIND_OR_CREATE_STARTUP_TAB'
	| 'SHOW_SPACE_LIST_OVERLAY'

export interface ExtensionMessage {
	type: ExtensionMessageType
	tabId?: number
	url?: string
	token?: string
	source?: 'webapp'
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
	source?: 'startup-extension'
	tabId?: number
	success: boolean
	error?: string
	tabs?: Tab[]
}
