import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { resourceApi } from '@/app/features/resource/api/resouceApi'
import type {
	ResourceState,
	CreateResourcePayload,
	UpdateResourcePayload,
	ReorderResourcePayload,
	MoveResourcePayload,
} from '@/app/features/resource/types/resouce'

const initialState: ResourceState = {
	resourcesBySection: {},
}

export const fetchResources = createAsyncThunk(
	'resource/fetchResources',
	async (sectionId: string) => {
		return await resourceApi.fetchResources(sectionId)
	},
)

export const createResource = createAsyncThunk(
	'resource/createResource',
	async (payload: CreateResourcePayload) => {
		return await resourceApi.createResource(payload)
	},
)

export const deleteResource = createAsyncThunk(
	'resource/deleteResource',
	async (resourceId: string) => {
		return await resourceApi.deleteResource(resourceId)
	},
)

export const updateResource = createAsyncThunk(
	'resource/updateResource',
	async (payload: UpdateResourcePayload) => {
		return await resourceApi.updateResource(payload)
	},
)

export const reorderResource = createAsyncThunk(
	'resource/reorderResource',
	async (payload: ReorderResourcePayload) => {
		return await resourceApi.reorderResource(payload)
	},
)

export const moveResource = createAsyncThunk(
	'resource/moveResource',
	async (payload: MoveResourcePayload) => {
		return await resourceApi.moveResource(payload)
	},
)

const resourceSlice = createSlice({
	name: 'resource',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			// fetchResources
			.addCase(fetchResources.pending, (state, action) => {
				state.resourcesBySection[action.meta.arg] = {
					resources: [],
					loading: true,
					error: null,
				}
			})
			.addCase(fetchResources.fulfilled, (state, action) => {
				state.resourcesBySection[action.meta.arg] = {
					resources: action.payload,
					loading: false,
					error: null,
				}
			})
			.addCase(fetchResources.rejected, (state, action) => {
				state.resourcesBySection[action.meta.arg] = {
					resources: [],
					loading: false,
					error: action.error.message || 'エラーが発生しました',
				}
			})
			// createResource
			.addCase(createResource.fulfilled, (state, action) => {
				const sectionId = action.payload.sectionId
				if (state.resourcesBySection[sectionId]) {
					state.resourcesBySection[sectionId].resources.push(action.payload)
				}
			})
			// deleteResource
			.addCase(deleteResource.fulfilled, (state, action) => {
				const { sectionId, deletedResource, updatedResources } = action.payload
				if (state.resourcesBySection[sectionId]) {
					// サーバーから返された更新済みのリソース配列で置き換え
					state.resourcesBySection[sectionId].resources = updatedResources
				}
			})
			// updateResource
			.addCase(updateResource.fulfilled, (state, action) => {
				const sectionId = action.payload.sectionId
				if (state.resourcesBySection[sectionId]) {
					state.resourcesBySection[sectionId].resources =
						state.resourcesBySection[sectionId].resources.map((resource) =>
							resource.id === action.payload.id ? action.payload : resource,
						)
				}
			})
			// reorderResource
			.addCase(reorderResource.fulfilled, (state, action) => {
				const { sectionId, updatedResources } = action.payload
				if (state.resourcesBySection[sectionId]) {
					// サーバーから返された更新済みのリソース配列で置き換え
					state.resourcesBySection[sectionId].resources = updatedResources
				}
			})
			// moveResource
			.addCase(moveResource.fulfilled, (state, action) => {
				const { movedResource, sourceSectionId, targetSectionId } =
					action.payload

				// 古いセクションからリソースを削除
				if (state.resourcesBySection[sourceSectionId]) {
					state.resourcesBySection[sourceSectionId].resources =
						state.resourcesBySection[sourceSectionId].resources.filter(
							(resource) => resource.id !== movedResource.id,
						)
				}

				// 新しいセクションにリソースを追加
				if (state.resourcesBySection[targetSectionId]) {
					state.resourcesBySection[targetSectionId].resources = [
						...state.resourcesBySection[targetSectionId].resources,
						movedResource,
					].sort((a, b) => a.order - b.order)
				}
			})
	},
})

export default resourceSlice.reducer
