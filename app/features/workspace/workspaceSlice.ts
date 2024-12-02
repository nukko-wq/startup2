import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from '@reduxjs/toolkit'
import { workspaceApi } from './workspaceApi'
import type {
	Workspace,
	WorkspaceState,
	RenameWorkspacePayload,
	ReorderWorkspacePayload,
} from './types/workspace'

const initialState: WorkspaceState = {
	workspaces: [],
	activeWorkspaceId: null,
	defaultWorkspace: null,
	loading: false,
	error: null,
}

export const fetchWorkspaces = createAsyncThunk(
	'workspace/fetchWorkspaces',
	async () => {
		return await workspaceApi.fetchWorkspaces()
	},
)

export const createWorkspace = createAsyncThunk(
	'workspace/createWorkspace',
	async (name: string) => {
		return await workspaceApi.createWorkspace(name)
	},
)

export const deleteWorkspace = createAsyncThunk(
	'workspace/deleteWorkspace',
	async (workspaceId: string) => {
		return await workspaceApi.deleteWorkspace(workspaceId)
	},
)

export const renameWorkspace = createAsyncThunk(
	'workspace/renameWorkspace',
	async ({ workspaceId, name }: RenameWorkspacePayload) => {
		return await workspaceApi.renameWorkspace(workspaceId, name)
	},
)

export const createDefaultWorkspace = createAsyncThunk(
	'workspace/createDefaultWorkspace',
	async () => {
		return await workspaceApi.createDefaultWorkspace()
	},
)

export const reorderWorkspace = createAsyncThunk(
	'workspace/reorderWorkspace',
	async ({ workspaceId, newOrder }: ReorderWorkspacePayload) => {
		return await workspaceApi.reorderWorkspace(workspaceId, newOrder)
	},
)

const workspaceSlice = createSlice({
	name: 'workspace',
	initialState,
	reducers: {
		setActiveWorkspace: (state, action: PayloadAction<string>) => {
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
				const defaultWorkspace = action.payload.find(
					(w: Workspace) => w.isDefault && w.order === 0,
				)
				const normalWorkspaces = action.payload.filter(
					(w: Workspace) => !w.isDefault,
				)

				state.defaultWorkspace = defaultWorkspace || null
				state.workspaces = normalWorkspaces
				state.loading = false
			})
			.addCase(fetchWorkspaces.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'エラーが発生しました'
			})
			.addCase(createWorkspace.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(createWorkspace.fulfilled, (state, action) => {
				state.workspaces.push(action.payload)
				state.loading = false
			})
			.addCase(createWorkspace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'エラーが発生しました'
			})
			.addCase(deleteWorkspace.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(deleteWorkspace.fulfilled, (state, action) => {
				state.workspaces = state.workspaces.filter(
					(workspace) => workspace.id !== action.payload.workspaceId,
				)
				state.loading = false
			})
			.addCase(deleteWorkspace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'エラーが発生しました'
			})
			.addCase(renameWorkspace.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(renameWorkspace.fulfilled, (state, action) => {
				const index = state.workspaces.findIndex(
					(w) => w.id === action.payload.id,
				)
				if (index !== -1) {
					state.workspaces[index] = action.payload
				}
				state.loading = false
			})
			.addCase(renameWorkspace.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'エラーが発生しました'
			})
			.addCase(createDefaultWorkspace.fulfilled, (state, action) => {
				state.defaultWorkspace = action.payload
				state.loading = false
			})
			.addCase(reorderWorkspace.fulfilled, (state, action) => {
				const updatedWorkspace = action.payload
				const nonDefaultWorkspaces = state.workspaces.filter(
					(w) => !w.isDefault,
				)

				const oldOrder =
					nonDefaultWorkspaces.find((w) => w.id === updatedWorkspace.id)
						?.order || 0
				const newOrder = updatedWorkspace.order

				state.workspaces = state.workspaces.map((workspace) => {
					if (workspace.isDefault) return workspace
					if (workspace.id === updatedWorkspace.id) return updatedWorkspace

					if (oldOrder < newOrder) {
						if (workspace.order > oldOrder && workspace.order <= newOrder) {
							return { ...workspace, order: workspace.order - 1 }
						}
					} else if (oldOrder > newOrder) {
						if (workspace.order >= newOrder && workspace.order < oldOrder) {
							return { ...workspace, order: workspace.order + 1 }
						}
					}
					return workspace
				})

				state.workspaces.sort((a, b) => {
					if (a.isDefault) return -1
					if (b.isDefault) return 1
					return a.order - b.order
				})
			})
	},
})

export const { setActiveWorkspace } = workspaceSlice.actions
export default workspaceSlice.reducer
