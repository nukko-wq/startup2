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
	},
})

export const { setActiveSpace } = spaceSlice.actions
export default spaceSlice.reducer
