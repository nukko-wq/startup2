export interface Space {
	id: string
	name: string
	order: number
	workspaceId: string
	isLastActive: boolean
}

export interface SpaceState {
	spacesByWorkspace: {
		[workspaceId: string]: {
			spaces: Space[]
			loading: boolean
			error: string | null
			lastFetched?: number
		}
	}
	allSpaces: {
		spaces: Space[]
		loading: boolean
		error: string | null
		lastFetched?: number
	}
	activeSpaceId: string | null
	error: string | null
	recentSpaces: Space[]
}

export interface CreateSpacePayload {
	name: string
	workspaceId: string
	optimisticId: string
}

export interface DeleteSpacePayload {
	spaceId: string
	workspaceId: string
}

export interface RenameSpacePayload {
	spaceId: string
	name: string
	workspaceId: string
}

export interface ReorderSpacePayload {
	spaceId: string
	workspaceId: string
	newOrder: number
	allOrders: { spaceId: string; newOrder: number }[]
}

export interface MoveSpacePayload {
	spaceId: string
	sourceWorkspaceId: string
	targetWorkspaceId: string
	newOrder: number
}

export interface SpaceApiResponse {
	spaces: Space[]
	activeSpaceId: string | null
	workspaceId: string
}

export interface CreateSpaceResponse {
	space: Space
	workspaceId: string
}

export interface DeleteSpaceResponse {
	deletedSpace: Space
	updatedSpaces: Space[]
	workspaceId: string
}

export interface ReorderSpaceResponse {
	updatedSpaces: Space[]
	workspaceId: string
}

export interface MoveSpaceResponse {
	movedSpace: Space
	sourceWorkspaceId: string
	targetWorkspaceId: string
}

export interface NormalizedSpaceState {
	entities: {
		[id: string]: Space
	}
	idsByWorkspace: {
		[workspaceId: string]: string[]
	}
	activeSpaceId: string | null
}

export interface ClearSpaceErrorPayload {
	workspaceId: string
}
