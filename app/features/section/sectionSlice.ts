import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { sectionApi } from '@/app/features/section/api/sectionApi'
import type {
	Section,
	SectionState,
	CreateSectionPayload,
	DeleteSectionPayload,
	RenameSectionPayload,
	ReorderSectionPayload,
} from './types/section'

const initialState: SectionState = {
	sectionsBySpace: {},
}

export const fetchSections = createAsyncThunk(
	'section/fetchSections',
	async (spaceId: string) => {
		return await sectionApi.fetchSections(spaceId)
	},
)

export const createSection = createAsyncThunk(
	'section/createSection',
	async (spaceId: string) => {
		return await sectionApi.createSection(spaceId)
	},
)

export const deleteSection = createAsyncThunk(
	'section/deleteSection',
	async ({ sectionId, spaceId }: DeleteSectionPayload) => {
		return await sectionApi.deleteSection(sectionId, spaceId)
	},
)

export const renameSection = createAsyncThunk(
	'section/renameSection',
	async ({ sectionId, name, spaceId }: RenameSectionPayload) => {
		return await sectionApi.renameSection(sectionId, name, spaceId)
	},
)

export const reorderSection = createAsyncThunk(
	'section/reorderSection',
	async ({ sectionId, newOrder, spaceId }: ReorderSectionPayload) => {
		return await sectionApi.reorderSection(sectionId, newOrder, spaceId)
	},
)

const sectionSlice = createSlice({
	name: 'section',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchSections.pending, (state, action) => {
				const spaceId = action.meta.arg
				state.sectionsBySpace[spaceId] = {
					sections: [],
					loading: true,
					error: null,
				}
			})
			.addCase(fetchSections.fulfilled, (state, action) => {
				const spaceId = action.meta.arg
				state.sectionsBySpace[spaceId] = {
					sections: action.payload,
					loading: false,
					error: null,
				}
			})
			.addCase(fetchSections.rejected, (state, action) => {
				const spaceId = action.meta.arg
				state.sectionsBySpace[spaceId] = {
					sections: [],
					loading: false,
					error: action.error.message || 'エラーが発生しました',
				}
			})
			.addCase(createSection.fulfilled, (state, action) => {
				const { section, spaceId } = action.payload
				const currentSections = state.sectionsBySpace[spaceId]?.sections || []

				state.sectionsBySpace[spaceId] = {
					sections: [...currentSections, section],
					loading: false,
					error: null,
				}
			})
			.addCase(deleteSection.fulfilled, (state, action) => {
				const { sectionId, spaceId } = action.payload
				const currentSections = state.sectionsBySpace[spaceId]?.sections || []

				state.sectionsBySpace[spaceId] = {
					sections: currentSections.filter(
						(section) => section.id !== sectionId,
					),
					loading: false,
					error: null,
				}
			})
			.addCase(renameSection.fulfilled, (state, action) => {
				const { section, spaceId } = action.payload
				const spaceState = state.sectionsBySpace[spaceId]
				if (spaceState) {
					const index = spaceState.sections.findIndex(
						(s) => s.id === section.id,
					)
					if (index !== -1) {
						spaceState.sections[index] = section
					}
				}
			})
			.addCase(reorderSection.fulfilled, (state, action) => {
				const { section, spaceId, allSections } = action.payload
				const spaceState = state.sectionsBySpace[spaceId]

				if (spaceState) {
					// APIから返された正規化された順序で更新
					spaceState.sections = allSections
				}
			})
	},
})

export default sectionSlice.reducer
