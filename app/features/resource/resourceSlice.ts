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
	}: {
		title: string
		url: string
		sectionId: string
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
	},
})

export default resourceSlice.reducer
