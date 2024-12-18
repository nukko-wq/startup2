import type { Space } from '@/app/features/space/types/space'

export interface Workspace {
	id: string
	name: string
	order: number
	isDefault: boolean
	userId: string
	createdAt: string
	updatedAt: string
	spaces: Space[]
}

export interface WorkspaceState {
	workspaces: Workspace[]
	activeWorkspaceId: string | null
	defaultWorkspace: Workspace | null
	loading: boolean
	error: string | null
	lastFetched?: number
}

export interface RenameWorkspacePayload {
	workspaceId: string
	name: string
}

export interface ReorderWorkspacePayload {
	workspaceId: string
	newOrder: number
}

export interface WorkspaceApiResponse extends Workspace {}

export interface CreateWorkspaceResponse extends Workspace {}

export interface DeleteWorkspaceResponse {
	deletedWorkspace: Workspace
	updatedWorkspaces: Workspace[]
}

export interface RenameWorkspaceResponse extends Workspace {}

export interface ReorderWorkspaceResponse extends Workspace {}

export interface CreateDefaultWorkspaceResponse extends Workspace {}

export interface CreateWorkspacePayload {
	name: string
	optimisticId: string
}
