import type {
	WorkspaceApiResponse,
	CreateWorkspaceResponse,
	DeleteWorkspaceResponse,
	RenameWorkspaceResponse,
	CreateDefaultWorkspaceResponse,
	ReorderWorkspaceResponse,
} from '@/app/features/workspace/types/workspace'

export const workspaceApi = {
	fetchWorkspaces: async (): Promise<WorkspaceApiResponse[]> => {
		const response = await fetch('/api/workspaces')
		if (!response.ok) {
			throw new Error('ワークスペースの取得に失敗しました')
		}
		return response.json()
	},

	createWorkspace: async (name: string): Promise<CreateWorkspaceResponse> => {
		const response = await fetch('/api/workspaces', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name }),
		})
		if (!response.ok) {
			throw new Error('ワークスペースの作成に失敗しました')
		}
		return response.json()
	},

	deleteWorkspace: async (
		workspaceId: string,
	): Promise<DeleteWorkspaceResponse> => {
		const response = await fetch(`/api/workspaces/${workspaceId}`, {
			method: 'DELETE',
		})
		if (!response.ok) {
			throw new Error('ワークスペースの削除に失敗しました')
		}
		return { workspaceId }
	},

	renameWorkspace: async (
		workspaceId: string,
		name: string,
	): Promise<RenameWorkspaceResponse> => {
		const response = await fetch(`/api/workspaces/${workspaceId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name }),
		})
		if (!response.ok) {
			throw new Error('ワークスペースの更新に失敗しました')
		}
		return response.json()
	},

	createDefaultWorkspace: async (): Promise<CreateDefaultWorkspaceResponse> => {
		const response = await fetch('/api/workspaces/default', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: 'Spaces' }),
		})
		if (!response.ok) {
			throw new Error('デフォルトワークスペースの作成に失敗しました')
		}
		return response.json()
	},

	reorderWorkspace: async (
		workspaceId: string,
		newOrder: number,
	): Promise<ReorderWorkspaceResponse> => {
		const response = await fetch(`/api/workspaces/${workspaceId}/reorder`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ order: newOrder + 1 }),
		})
		if (!response.ok) {
			throw new Error('ワークスペースの並び替えに失敗しました')
		}
		return response.json()
	},
}
