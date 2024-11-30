import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface Space {
	id: string
	name: string
	order: number
	workspaceId: string
	isLastActive: boolean
}

interface SpaceState {
	spacesByWorkspace: {
		[workspaceId: string]: {
			spaces: Space[]
			loading: boolean
			error: string | null
		}
	}
	activeSpaceId: string | null
}

const initialState: SpaceState = {
	spacesByWorkspace: {},
	activeSpaceId: null,
}

export const fetchSpaces = createAsyncThunk(
	'space/fetchSpaces',
	async (workspaceId: string) => {
		const response = await fetch(`/api/workspaces/${workspaceId}/spaces`)
		if (!response.ok) {
			throw new Error('スペースの取得に失敗しました')
		}
		const data = await response.json()
		const activeSpace = data.find((space: Space) => space.isLastActive)
		return { spaces: data, activeSpaceId: activeSpace?.id || null, workspaceId }
	},
)

export const createSpace = createAsyncThunk(
	'space/createSpace',
	async ({ name, workspaceId }: { name: string; workspaceId: string }) => {
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
)

export const deleteSpace = createAsyncThunk(
	'space/deleteSpace',
	async ({
		spaceId,
		workspaceId,
	}: { spaceId: string; workspaceId: string }) => {
		const response = await fetch(
			`/api/workspaces/${workspaceId}/spaces/${spaceId}`,
			{
				method: 'DELETE',
			},
		)
		if (!response.ok) {
			throw new Error('スペースの削除に失敗しました')
		}
		return { spaceId, workspaceId }
	},
)

export const setActiveSpace = createAsyncThunk(
	'space/setActiveSpace',
	async (spaceId: string) => {
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
)

export const renameSpace = createAsyncThunk(
	'space/renameSpace',
	async ({
		spaceId,
		name,
		workspaceId,
	}: { spaceId: string; name: string; workspaceId: string }) => {
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
)

interface ReorderSpaceResponse {
	updatedSpaces: Space[]
	workspaceId: string
}

export const reorderSpace = createAsyncThunk<
	ReorderSpaceResponse,
	{
		spaceId: string
		workspaceId: string
		newOrder: number
		allOrders: { spaceId: string; newOrder: number }[]
	}
>(
	'space/reorderSpace',
	async ({ spaceId, workspaceId, newOrder, allOrders }) => {
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
)

export const moveSpace = createAsyncThunk(
	'space/moveSpace',
	async ({
		spaceId,
		sourceWorkspaceId,
		targetWorkspaceId,
		newOrder,
	}: {
		spaceId: string
		sourceWorkspaceId: string
		targetWorkspaceId: string
		newOrder: number
	}) => {
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
)

const spaceSlice = createSlice({
	name: 'space',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSpaces.pending, (state, action) => {
				const workspaceId = action.meta.arg
				state.spacesByWorkspace[workspaceId] = {
					spaces: state.spacesByWorkspace[workspaceId]?.spaces || [],
					loading: true,
					error: null,
				}
			})
			.addCase(fetchSpaces.fulfilled, (state, action) => {
				const { spaces, activeSpaceId, workspaceId } = action.payload
				state.spacesByWorkspace[workspaceId] = {
					spaces,
					loading: false,
					error: null,
				}
				if (activeSpaceId) {
					state.activeSpaceId = activeSpaceId
				}
			})
			.addCase(fetchSpaces.rejected, (state, action) => {
				const workspaceId = action.meta.arg
				state.spacesByWorkspace[workspaceId] = {
					spaces: state.spacesByWorkspace[workspaceId]?.spaces || [],
					loading: false,
					error: action.error.message || 'エラーが発生しました',
				}
			})
			.addCase(createSpace.pending, (state, action) => {
				const workspaceId = action.meta.arg.workspaceId
				if (!state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId] = {
						spaces: [],
						loading: true,
						error: null,
					}
				}
				state.spacesByWorkspace[workspaceId].loading = true
				state.spacesByWorkspace[workspaceId].error = null
			})
			.addCase(createSpace.fulfilled, (state, action) => {
				const { space, workspaceId } = action.payload
				if (!state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId] = {
						spaces: [],
						loading: false,
						error: null,
					}
				}
				state.spacesByWorkspace[workspaceId].spaces.push(space)
				state.spacesByWorkspace[workspaceId].loading = false
			})
			.addCase(createSpace.rejected, (state, action) => {
				const workspaceId = action.meta.arg.workspaceId
				if (!state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId] = {
						spaces: [],
						loading: false,
						error: null,
					}
				}
				state.spacesByWorkspace[workspaceId].loading = false
				state.spacesByWorkspace[workspaceId].error =
					action.error.message || 'エラーが発生しました'
			})
			.addCase(deleteSpace.pending, (state, action) => {
				const { workspaceId } = action.meta.arg
				if (state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId].loading = true
					state.spacesByWorkspace[workspaceId].error = null
				}
			})
			.addCase(deleteSpace.fulfilled, (state, action) => {
				const { spaceId, workspaceId } = action.payload
				if (state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId].spaces = state.spacesByWorkspace[
						workspaceId
					].spaces.filter((space) => space.id !== spaceId)
					state.spacesByWorkspace[workspaceId].loading = false
				}
			})
			.addCase(deleteSpace.rejected, (state, action) => {
				const { workspaceId } = action.meta.arg
				if (state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId].loading = false
					state.spacesByWorkspace[workspaceId].error =
						action.error.message || 'エラーが発生しました'
				}
			})
			.addCase(setActiveSpace.pending, (state) => {
				// オプション: ローディング状態の管理が必要な場合
			})
			.addCase(setActiveSpace.fulfilled, (state, action) => {
				state.activeSpaceId = action.payload
				// 全てのスペースのisLastActiveをfalseに設定
				for (const workspace of Object.values(state.spacesByWorkspace)) {
					for (const space of workspace.spaces) {
						space.isLastActive = space.id === action.payload
					}
				}
			})
			.addCase(setActiveSpace.rejected, (state, action) => {
				// エラー処理が必要な場合
			})
			.addCase(renameSpace.fulfilled, (state, action) => {
				const { space, workspaceId } = action.payload
				const workspaceState = state.spacesByWorkspace[workspaceId]
				if (workspaceState) {
					const index = workspaceState.spaces.findIndex(
						(s) => s.id === space.id,
					)
					if (index !== -1) {
						workspaceState.spaces[index] = space
					}
				}
			})
			.addCase(reorderSpace.fulfilled, (state, action) => {
				const { updatedSpaces, workspaceId } = action.payload
				if (state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId].spaces = updatedSpaces
				}
			})
			.addCase(moveSpace.fulfilled, (state, action) => {
				const { movedSpace, sourceWorkspaceId, targetWorkspaceId } =
					action.payload

				// 元のワークスペースからスペースを削除
				if (state.spacesByWorkspace[sourceWorkspaceId]) {
					state.spacesByWorkspace[sourceWorkspaceId].spaces =
						state.spacesByWorkspace[sourceWorkspaceId].spaces.filter(
							(space) => space.id !== movedSpace.id,
						)
				}

				// 新しいワークスペースにスペースを追加
				if (state.spacesByWorkspace[targetWorkspaceId]) {
					state.spacesByWorkspace[targetWorkspaceId].spaces = [
						...state.spacesByWorkspace[targetWorkspaceId].spaces,
						movedSpace,
					].sort((a, b) => a.order - b.order)
				}
			})
	},
})

export default spaceSlice.reducer
