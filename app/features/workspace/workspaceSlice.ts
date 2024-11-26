import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface WorkspaceState {
	workspaces: Workspace[]
	activeWorkspaceId: string | null
	loading: boolean
	error: string | null
}

const initialState: WorkspaceState = {
	workspaces: [],
	activeWorkspaceId: null,
	loading: false,
	error: null,
}

export const fetchWorkspaces = createAsyncThunk(
	'workspace/fetchWorkspaces',
	async () => {
		const response = await fetch('/api/workspaces')
		if (!response.ok) {
			throw new Error('ワークスペースの取得に失敗しました')
		}
		const data = await response.json()
		return data
	},
)

const workspaceSlice = createSlice({
	name: 'workspace',
	initialState,
	reducers: {
		setActiveWorkspace: (state, action) => {
			state.activeWorkspaceId = action.payload
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchWorkspaces.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchWorkspaces.fulfilled, (state, action) => {
				state.workspaces = action.payload
				state.loading = false
			})
			.addCase(fetchWorkspaces.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'エラーが発生しました'
			})
	},
})

export const { setActiveWorkspace } = workspaceSlice.actions
export default workspaceSlice.reducer
