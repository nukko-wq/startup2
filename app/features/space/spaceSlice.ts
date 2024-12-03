import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { spaceApi } from '@/app/features/space/api/spaceApi'
import type {
	Space,
	SpaceState,
	CreateSpacePayload,
	DeleteSpacePayload,
	RenameSpacePayload,
	ReorderSpacePayload,
	MoveSpacePayload,
} from './types/space'

const initialState: SpaceState = {
	spacesByWorkspace: {},
	activeSpaceId: null,
}

export const fetchSpaces = createAsyncThunk(
	'space/fetchSpaces',
	async (workspaceId: string) => {
		return await spaceApi.fetchSpaces(workspaceId)
	},
)

export const createSpace = createAsyncThunk(
	'space/createSpace',
	async ({ name, workspaceId }: CreateSpacePayload) => {
		return await spaceApi.createSpace(name, workspaceId)
	},
)

export const deleteSpace = createAsyncThunk(
	'space/deleteSpace',
	async ({ spaceId, workspaceId }: DeleteSpacePayload) => {
		return await spaceApi.deleteSpace(spaceId, workspaceId)
	},
)

export const setActiveSpace = createAsyncThunk(
	'space/setActiveSpace',
	async (spaceId: string) => {
		return await spaceApi.setActiveSpace(spaceId)
	},
)

export const renameSpace = createAsyncThunk(
	'space/renameSpace',
	async ({ spaceId, name, workspaceId }: RenameSpacePayload) => {
		return await spaceApi.renameSpace(spaceId, name, workspaceId)
	},
)

export const reorderSpace = createAsyncThunk(
	'space/reorderSpace',
	async ({
		spaceId,
		workspaceId,
		newOrder,
		allOrders,
	}: ReorderSpacePayload) => {
		return await spaceApi.reorderSpace(
			spaceId,
			workspaceId,
			newOrder,
			allOrders,
		)
	},
)

export const moveSpace = createAsyncThunk(
	'space/moveSpace',
	async ({
		spaceId,
		sourceWorkspaceId,
		targetWorkspaceId,
		newOrder,
	}: MoveSpacePayload) => {
		return await spaceApi.moveSpace(
			spaceId,
			sourceWorkspaceId,
			targetWorkspaceId,
			newOrder,
		)
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
				const { workspaceId, updatedSpaces } = action.payload
				if (state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId] = {
						...state.spacesByWorkspace[workspaceId],
						spaces: updatedSpaces,
						loading: false,
					}
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
