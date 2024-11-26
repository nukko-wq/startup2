import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

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
		return data
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

const spaceSlice = createSlice({
	name: 'space',
	initialState,
	reducers: {
		setActiveSpace: (state, action) => {
			state.activeSpaceId = action.payload
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
				const workspaceId = action.meta.arg
				state.spacesByWorkspace[workspaceId] = {
					spaces: action.payload,
					loading: false,
					error: null,
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
	},
})

export const { setActiveSpace } = spaceSlice.actions
export default spaceSlice.reducer
