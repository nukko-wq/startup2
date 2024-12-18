import {
	createSlice,
	createAsyncThunk,
	type PayloadAction,
} from '@reduxjs/toolkit'
import { resourceApi } from '@/app/features/resource/api/resouceApi'
import type { Resource } from '@prisma/client'
import type {
	ResourceState,
	CreateResourcePayload,
	UpdateResourcePayload,
	ReorderResourcePayload,
	MoveResourcePayload,
} from '@/app/features/resource/types/resouce'
import type { RootState } from '@/app/store/store'

const initialState: ResourceState = {
	resourcesBySection: {},
}

export const fetchResources = createAsyncThunk(
	'resource/fetchResources',
	async (sectionId: string, { getState }) => {
		const state = getState() as RootState
		const sectionResources = state.resource.resourcesBySection[sectionId]

		if (
			sectionResources?.lastFetched &&
			Date.now() - sectionResources.lastFetched < 5 * 60 * 1000
		) {
			return sectionResources.resources
		}

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
	reducers: {
		addResourceOptimistically: (state, action) => {
			const { sectionId, resource } = action.payload
			if (state.resourcesBySection[sectionId]) {
				state.resourcesBySection[sectionId].resources.push(resource)
			}
		},
		removeResourceOptimistically: (state, action) => {
			const { sectionId, resourceId } = action.payload
			if (state.resourcesBySection[sectionId]) {
				state.resourcesBySection[sectionId].resources =
					state.resourcesBySection[sectionId].resources.filter(
						(resource) => resource.id !== resourceId,
					)
			}
		},
		updateResourceOptimistically: (state, action) => {
			const { sectionId, updatedResource } = action.payload
			if (state.resourcesBySection[sectionId]) {
				state.resourcesBySection[sectionId].resources =
					state.resourcesBySection[sectionId].resources.map((resource) =>
						resource.id === updatedResource.id ? updatedResource : resource,
					)
			}
		},
		setResourcesBySection: (
			state,
			action: PayloadAction<{ [sectionId: string]: Resource[] }>,
		) => {
			for (const [sectionId, resources] of Object.entries(action.payload)) {
				state.resourcesBySection[sectionId] = {
					resources,
					loading: false,
					error: null,
					lastFetched: Date.now(),
				}
			}
		},
	},
	extraReducers: (builder) => {
		builder
			// fetchResources
			.addCase(fetchResources.pending, (state, action) => {
				const sectionId = action.meta.arg
				state.resourcesBySection[sectionId] = {
					...state.resourcesBySection[sectionId],
					loading: true,
					error: null,
				}
			})
			.addCase(fetchResources.fulfilled, (state, action) => {
				const sectionId = action.meta.arg
				state.resourcesBySection[sectionId] = {
					resources: action.payload,
					loading: false,
					error: null,
					lastFetched: Date.now(),
				}
			})
			.addCase(fetchResources.rejected, (state, action) => {
				const sectionId = action.meta.arg
				state.resourcesBySection[sectionId] = {
					...state.resourcesBySection[sectionId],
					loading: false,
					error: action.error.message || 'エラーが発生しました',
				}
			})
			// createResource
			.addCase(createResource.fulfilled, (state, action) => {
				const sectionId = action.payload.sectionId
				const optimisticId = action.meta.arg.optimisticId

				if (!state.resourcesBySection[sectionId]) {
					state.resourcesBySection[sectionId] = {
						resources: [],
						loading: false,
						error: null,
						lastFetched: Date.now(),
					}
				}

				state.resourcesBySection[sectionId].resources =
					state.resourcesBySection[sectionId].resources.filter(
						(r) => r.id !== optimisticId,
					)

				state.resourcesBySection[sectionId].resources = [
					...state.resourcesBySection[sectionId].resources,
					action.payload,
				].sort((a, b) => a.order - b.order)

				state.resourcesBySection[sectionId].lastFetched = Date.now()
			})
			.addCase(createResource.rejected, (state, action) => {
				const { sectionId, optimisticId } = action.meta.arg
				if (state.resourcesBySection[sectionId]) {
					state.resourcesBySection[sectionId].resources =
						state.resourcesBySection[sectionId].resources.filter(
							(resource) => resource.id !== optimisticId,
						)
					state.resourcesBySection[sectionId].error =
						action.error.message || 'リソースの作成に失敗しました'
				}
			})
			// deleteResource
			.addCase(deleteResource.pending, (state, action) => {
				const resourceId = action.meta.arg
				for (const sectionId of Object.keys(state.resourcesBySection)) {
					const section = state.resourcesBySection[sectionId]
					const resourceIndex = section.resources.findIndex(
						(r) => r.id === resourceId,
					)

					if (resourceIndex !== -1) {
						const resources = [...section.resources]
						resources.splice(resourceIndex, 1)

						const updatedResources = resources.map((resource, index) => ({
							...resource,
							order: index,
						}))

						state.resourcesBySection[sectionId].resources = updatedResources
					}
				}
			})
			.addCase(deleteResource.fulfilled, (state, action) => {
				const { sectionId, updatedResources } = action.payload
				if (state.resourcesBySection[sectionId]) {
					state.resourcesBySection[sectionId].resources = updatedResources
				}
			})
			.addCase(deleteResource.rejected, (state, action) => {
				console.error('Failed to delete resource:', action.error)
				if (state.resourcesBySection[action.meta.arg]) {
					state.resourcesBySection[action.meta.arg].error =
						action.error.message || 'リソースの削除に失敗しました'
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
					state.resourcesBySection[sectionId].resources = updatedResources
				}
			})
			// moveResource
			.addCase(moveResource.fulfilled, (state, action) => {
				const { movedResource, sourceSectionId, targetSectionId } =
					action.payload

				if (state.resourcesBySection[sourceSectionId]) {
					state.resourcesBySection[sourceSectionId].resources =
						state.resourcesBySection[sourceSectionId].resources.filter(
							(resource) => resource.id !== movedResource.id,
						)
				}

				if (state.resourcesBySection[targetSectionId]) {
					state.resourcesBySection[targetSectionId].resources = [
						...state.resourcesBySection[targetSectionId].resources,
						movedResource,
					].sort((a, b) => a.order - b.order)
				}
			})
	},
})

export const {
	addResourceOptimistically,
	removeResourceOptimistically,
	updateResourceOptimistically,
	setResourcesBySection,
} = resourceSlice.actions

export default resourceSlice.reducer
