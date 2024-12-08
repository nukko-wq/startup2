import type {
	Space,
	SpaceApiResponse,
	CreateSpaceResponse,
	DeleteSpaceResponse,
	ReorderSpaceResponse,
	MoveSpaceResponse,
} from '@/app/features/space/types/space'

export interface FetchAllSpacesResponse {
	spaces: Space[]
	activeSpaceId: string | null
	workspaceId: string
}

export const spaceApi = {
	fetchSpaces: async (workspaceId: string): Promise<SpaceApiResponse> => {
		const response = await fetch(`/api/workspaces/${workspaceId}/spaces`, {
			headers: {
				'Cache-Control': 'max-age=300',
			},
		})
		if (!response.ok) {
			throw new Error('スペースの取得に失敗しました')
		}
		const data: Space[] = await response.json()
		const activeSpace = data.find((space: Space) => space.isLastActive)
		return {
			spaces: data,
			activeSpaceId: activeSpace?.id || null,
			workspaceId,
		}
	},

	createSpace: async (
		name: string,
		workspaceId: string,
	): Promise<CreateSpaceResponse> => {
		const response = await fetch(`/api/workspaces/${workspaceId}/spaces`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name }),
		})
		if (!response.ok) {
			throw new Error('スペースの作成に失敗しました')
		}
		const data = await response.json()
		return { space: data, workspaceId }
	},

	deleteSpace: async (
		spaceId: string,
		workspaceId: string,
	): Promise<DeleteSpaceResponse> => {
		const response = await fetch(
			`/api/workspaces/${workspaceId}/spaces/${spaceId}`,
			{
				method: 'DELETE',
			},
		)
		if (!response.ok) {
			throw new Error('スペースの削除に失敗しました')
		}
		return response.json()
	},

	setActiveSpace: async (spaceId: string) => {
		const response = await fetch(`/api/spaces/${spaceId}/active`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		if (!response.ok) {
			throw new Error('アクティブスペースの設定に失敗しました')
		}
		return spaceId
	},

	renameSpace: async (spaceId: string, name: string, workspaceId: string) => {
		const response = await fetch(
			`/api/workspaces/${workspaceId}/spaces/${spaceId}`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name }),
			},
		)
		if (!response.ok) {
			throw new Error('スペースの名前変更に失敗しました')
		}
		const data = await response.json()
		return { space: data, workspaceId }
	},

	reorderSpace: async (
		spaceId: string,
		workspaceId: string,
		newOrder: number,
		allOrders: { spaceId: string; newOrder: number }[],
	) => {
		const response = await fetch(
			`/api/workspaces/${workspaceId}/spaces/${spaceId}/reorder`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					order: newOrder,
					allOrders,
				}),
			},
		)
		if (!response.ok) {
			throw new Error('スペースの並び替えに失敗しました')
		}
		const data = await response.json()
		return {
			updatedSpaces: data.updatedSpaces,
			workspaceId,
		}
	},

	moveSpace: async (
		spaceId: string,
		sourceWorkspaceId: string,
		targetWorkspaceId: string,
		newOrder: number,
	) => {
		const response = await fetch(
			`/api/workspaces/${sourceWorkspaceId}/spaces/${spaceId}/move`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					targetWorkspaceId,
					order: newOrder,
				}),
			},
		)
		if (!response.ok) {
			throw new Error('スペースの移動に失敗しました')
		}
		return response.json()
	},

	fetchAllSpaces: async (): Promise<FetchAllSpacesResponse> => {
		const response = await fetch('/api/spaces')
		if (!response.ok) {
			throw new Error('全スペースの取得に失敗しました')
		}
		const data = await response.json()
		const activeSpace = data.find((space: Space) => space.isLastActive)
		return {
			spaces: data,
			activeSpaceId: activeSpace?.id || null,
			workspaceId: data[0]?.workspaceId || '',
		}
	},
}
