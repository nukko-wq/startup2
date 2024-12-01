import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from '@reduxjs/toolkit'

interface WorkspaceState {
	workspaces: Workspace[]
	activeWorkspaceId: string | null
	defaultWorkspace: Workspace | null
	loading: boolean
	error: string | null
}

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
		const response = await fetch('/api/workspaces')
		if (!response.ok) {
			throw new Error('ワークスペースの取得に失敗しました')
		}
		const data = await response.json()
		return data
	},
)

export const createWorkspace = createAsyncThunk(
	'workspace/createWorkspace',
	async (name: string) => {
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
		const data = await response.json()
		return data
	},
)

export const deleteWorkspace = createAsyncThunk(
	'workspace/deleteWorkspace',
	async (workspaceId: string) => {
		const response = await fetch(`/api/workspaces/${workspaceId}`, {
			method: 'DELETE',
		})
		if (!response.ok) {
			throw new Error('ワークスペースの削除に失敗しました')
		}
		return workspaceId
	},
)

interface RenameWorkspacePayload {
	workspaceId: string
	name: string
}

export const renameWorkspace = createAsyncThunk(
	'workspace/renameWorkspace',
	async ({ workspaceId, name }: RenameWorkspacePayload) => {
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
		const data = await response.json()
		return data
	},
)

export const createDefaultWorkspace = createAsyncThunk(
	'workspace/createDefaultWorkspace',
	async () => {
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
		const data = await response.json()
		return data
	},
)

export const reorderWorkspace = createAsyncThunk(
	'workspace/reorderWorkspace',
	async ({
		workspaceId,
		newOrder,
	}: { workspaceId: string; newOrder: number }) => {
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
		const data = await response.json()
		return data
	},
)

// Workspaceインターフェースを追加
interface Workspace {
	id: string
	name: string
	order: number
	isDefault: boolean
	userId: string
	createdAt: string
	updatedAt: string
}

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
					(workspace) => workspace.id !== action.payload,
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
