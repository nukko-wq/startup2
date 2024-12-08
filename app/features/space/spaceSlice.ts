import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from '@reduxjs/toolkit'
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
import { fetchSectionsWithResources } from '@/app/features/section/sectionSlice'

const initialState: SpaceState = {
	spacesByWorkspace: {},
	activeSpaceId: null,
	allSpaces: {
		spaces: [],
		loading: false,
		error: null,
	},
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
	async (spaceId: string, { dispatch }) => {
		const [activeSpaceResult, sectionsWithResources] = await Promise.all([
			spaceApi.setActiveSpace(spaceId),
			dispatch(fetchSectionsWithResources(spaceId)).unwrap(),
		])

		return activeSpaceResult
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

export const fetchAllSpaces = createAsyncThunk(
	'space/fetchAllSpaces',
	async () => {
		return await spaceApi.fetchAllSpaces()
	},
)

const spaceSlice = createSlice({
	name: 'space',
	initialState,
	reducers: {
		addSpaceOptimistically: (
			state,
			action: PayloadAction<{
				workspaceId: string
				space: Space
			}>,
		) => {
			const { workspaceId, space } = action.payload
			if (!state.spacesByWorkspace[workspaceId]) {
				state.spacesByWorkspace[workspaceId] = {
					spaces: [],
					loading: false,
					error: null,
				}
			}
			state.spacesByWorkspace[workspaceId].spaces.push(space)
		},
		removeSpaceOptimistically: (
			state,
			action: PayloadAction<{
				workspaceId: string
				spaceId: string
			}>,
		) => {
			const { workspaceId, spaceId } = action.payload
			if (state.spacesByWorkspace[workspaceId]) {
				state.spacesByWorkspace[workspaceId].spaces = state.spacesByWorkspace[
					workspaceId
				].spaces.filter((space) => space.id !== spaceId)
			}
		},
		renameSpaceOptimistically: (
			state,
			action: PayloadAction<{
				workspaceId: string
				spaceId: string
				name: string
			}>,
		) => {
			const { workspaceId, spaceId, name } = action.payload
			const workspaceState = state.spacesByWorkspace[workspaceId]
			if (workspaceState) {
				const index = workspaceState.spaces.findIndex((s) => s.id === spaceId)
				if (index !== -1) {
					workspaceState.spaces[index] = {
						...workspaceState.spaces[index],
						name,
					}
				}
			}
		},
	},
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

				// 楽観的に追加したスペースを実際のスペースで置き換える
				const existingIndex = state.spacesByWorkspace[
					workspaceId
				].spaces.findIndex(
					(s) => s.id === space.id || s.id === action.meta.arg.optimisticId,
				)

				if (existingIndex !== -1) {
					// 既存のスペースを更新
					state.spacesByWorkspace[workspaceId].spaces[existingIndex] = space
				} else {
					// 新しいスペースを追加（通常はここには到達しない）
					state.spacesByWorkspace[workspaceId].spaces.push(space)
				}

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
				const { spaceId, workspaceId } = action.meta.arg
				const workspaceState = state.spacesByWorkspace[workspaceId]

				if (workspaceState) {
					// 削除対象のスペースを即座に削除
					const spaceIndex = workspaceState.spaces.findIndex(
						(s) => s.id === spaceId,
					)
					if (spaceIndex !== -1) {
						const spaces = [...workspaceState.spaces]
						spaces.splice(spaceIndex, 1)

						// 後続のスペースのorderを更新
						const updatedSpaces = spaces.map((space, index) => ({
							...space,
							order: index,
						}))

						workspaceState.spaces = updatedSpaces
					}
				}
			})
			.addCase(deleteSpace.fulfilled, (state, action) => {
				const { workspaceId, updatedSpaces } = action.payload
				if (state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId].spaces = updatedSpaces
				}
			})
			.addCase(deleteSpace.rejected, (state, action) => {
				const { workspaceId } = action.meta.arg
				if (state.spacesByWorkspace[workspaceId]) {
					state.spacesByWorkspace[workspaceId].error =
						action.error.message || 'スペースの削除に失敗しました'
					// エラー時は再フェッチで状態を復元
					state.spacesByWorkspace[workspaceId].loading = true
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
			.addCase(fetchAllSpaces.pending, (state) => {
				state.allSpaces = {
					spaces: [],
					loading: true,
					error: null,
				}
			})
			.addCase(fetchAllSpaces.fulfilled, (state, action) => {
				state.allSpaces = {
					spaces: action.payload,
					loading: false,
					error: null,
				}
			})
			.addCase(fetchAllSpaces.rejected, (state, action) => {
				state.allSpaces = {
					spaces: [],
					loading: false,
					error: action.error.message || 'エラーが発生しました',
				}
			})
	},
})

export const {
	addSpaceOptimistically,
	removeSpaceOptimistically,
	renameSpaceOptimistically,
} = spaceSlice.actions

export default spaceSlice.reducer
