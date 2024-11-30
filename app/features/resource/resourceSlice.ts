import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Resource } from '@prisma/client'

interface ResourceState {
	resourcesBySection: {
		[sectionId: string]: {
			resources: Resource[]
			loading: boolean
			error: string | null
		}
	}
}

const initialState: ResourceState = {
	resourcesBySection: {},
}

// リソース追加のThunk
export const createResource = createAsyncThunk(
	'resource/createResource',
	async ({
		title,
		url,
		sectionId,
		faviconUrl,
		mimeType,
		description,
		isGoogleDrive,
	}: {
		title: string
		url: string
		sectionId: string
		faviconUrl?: string
		mimeType?: string
		description?: string
		isGoogleDrive?: boolean
	}) => {
		const response = await fetch('/api/resources', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
				url,
				sectionId,
				faviconUrl,
				mimeType,
				description,
				isGoogleDrive,
			}),
		})

		if (!response.ok) {
			throw new Error('リソースの作成に失敗しました')
		}

		return response.json()
	},
)

// セクション内のリソース取得のThunk
export const fetchResources = createAsyncThunk(
	'resource/fetchResources',
	async (sectionId: string) => {
		const response = await fetch(`/api/sections/${sectionId}/resources`)
		if (!response.ok) {
			throw new Error('リソースの取得に失敗しました')
		}
		return response.json()
	},
)

// リソース削除のThunk
export const deleteResource = createAsyncThunk(
	'resource/deleteResource',
	async (resourceId: string) => {
		const response = await fetch(`/api/resources/${resourceId}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			throw new Error('リソースの削除に失敗しました')
		}

		return response.json()
	},
)

// リソース更新のThunk
export const updateResource = createAsyncThunk(
	'resource/updateResource',
	async ({
		id,
		title,
		url,
		description,
	}: {
		id: string
		title: string
		url: string
		description?: string
	}) => {
		const response = await fetch(`/api/resources/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
				url,
				description,
			}),
		})

		if (!response.ok) {
			throw new Error('リソースの更新に失敗しました')
		}

		return response.json()
	},
)

// リソースの並び替えのThunk
export const reorderResource = createAsyncThunk(
	'resource/reorderResource',
	async ({
		resourceId,
		sectionId,
		newOrder,
	}: { resourceId: string; sectionId: string; newOrder: number }) => {
		const response = await fetch(`/api/resources/${resourceId}/reorder`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ sectionId, order: newOrder }),
		})

		if (!response.ok) {
			throw new Error('リソースの並び替えに失敗しました')
		}

		return response.json()
	},
)

// リソースの移動のThunk
export const moveResource = createAsyncThunk(
	'resource/moveResource',
	async ({
		resourceId,
		targetSectionId,
		newOrder,
	}: { resourceId: string; targetSectionId: string; newOrder: number }) => {
		const response = await fetch(`/api/resources/${resourceId}/move`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ sectionId: targetSectionId, order: newOrder }),
		})

		if (!response.ok) {
			throw new Error('リソースの移動に失敗しました')
		}

		return response.json()
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
				const sectionId = action.payload.sectionId
				if (state.resourcesBySection[sectionId]) {
					state.resourcesBySection[sectionId].resources =
						state.resourcesBySection[sectionId].resources.filter(
							(resource) => resource.id !== action.payload.id,
						)
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
				const { sectionId } = action.payload
				if (state.resourcesBySection[sectionId]) {
					state.resourcesBySection[sectionId].resources =
						state.resourcesBySection[sectionId].resources.map((resource) =>
							resource.id === action.payload.id ? action.payload : resource,
						)
				}
			})
			// moveResource
			.addCase(moveResource.fulfilled, (state, action) => {
				const { sectionId: oldSectionId, targetSectionId } = action.payload
				// 古いセクションから削除
				if (state.resourcesBySection[oldSectionId]) {
					state.resourcesBySection[oldSectionId].resources =
						state.resourcesBySection[oldSectionId].resources.filter(
							(resource) => resource.id !== action.payload.id,
						)
				}
				// 新しいセクションに追加
				if (state.resourcesBySection[targetSectionId]) {
					state.resourcesBySection[targetSectionId].resources.push(
						action.payload,
					)
				}
			})
	},
})

export default resourceSlice.reducer
