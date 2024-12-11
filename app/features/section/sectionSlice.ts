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
import { v4 as uuidv4 } from 'uuid'
import { setResourcesBySection } from '@/app/features/resource/resourceSlice'
import type { RootState } from '@/app/store/store'

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
	async (payload: CreateSectionPayload) => {
		return await sectionApi.createSection(payload.spaceId)
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

export const fetchSectionsWithResources = createAsyncThunk(
	'section/fetchSectionsWithResources',
	async (spaceId: string, { dispatch }) => {
		console.log('Starting fetchSectionsWithResources:', spaceId)

		try {
			console.log('Fetching from API for spaceId:', spaceId)
			const data = await sectionApi.fetchSectionsWithResources(spaceId)
			console.log('API response received:', data)

			if (data.resources) {
				dispatch(setResourcesBySection(data.resources))
			}

			return {
				sections: data.sections || [],
				spaceId,
				lastFetched: Date.now(),
			}
		} catch (error) {
			console.error('Error fetching sections:', error)
			throw error
		}
	},
	{
		condition: (spaceId, { getState }) => {
			const state = getState() as RootState
			const sectionState = state.section.sectionsBySpace[spaceId]

			if (sectionState?.loading) {
				console.log('Skipping fetch - already loading:', spaceId)
				return false
			}

			const cacheAge = sectionState?.lastFetched
				? Date.now() - sectionState.lastFetched
				: Number.POSITIVE_INFINITY

			if (sectionState?.sections?.length > 0 && cacheAge < 5 * 60 * 1000) {
				console.log('Using cached data for spaceId:', spaceId)
				return false
			}

			return true
		},
	},
)

const sectionSlice = createSlice({
	name: 'section',
	initialState,
	reducers: {
		addSectionOptimistically: (state, action) => {
			const { spaceId, section } = action.payload
			if (state.sectionsBySpace[spaceId]) {
				state.sectionsBySpace[spaceId].sections.push(section)
			} else {
				state.sectionsBySpace[spaceId] = {
					sections: [section],
					loading: false,
					error: null,
				}
			}
		},
		removeSectionOptimistically: (state, action) => {
			const { spaceId, sectionId } = action.payload
			if (state.sectionsBySpace[spaceId]) {
				state.sectionsBySpace[spaceId].sections = state.sectionsBySpace[
					spaceId
				].sections.filter((section) => section.id !== sectionId)
			}
		},
		renameSectionOptimistically: (state, action) => {
			const { spaceId, sectionId, name } = action.payload
			const spaceState = state.sectionsBySpace[spaceId]

			if (spaceState) {
				spaceState.sections = spaceState.sections.map((section) =>
					section.id === sectionId ? { ...section, name } : section,
				)
			}
		},
	},
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
				const spaceState = state.sectionsBySpace[spaceId]

				if (spaceState) {
					spaceState.sections = spaceState.sections.map((s) =>
						s.id === action.meta.arg.optimisticId ? section : s,
					)
				}
			})
			.addCase(createSection.rejected, (state, action) => {
				const { spaceId, optimisticId } = action.meta.arg
				if (state.sectionsBySpace[spaceId]) {
					state.sectionsBySpace[spaceId].sections = state.sectionsBySpace[
						spaceId
					].sections.filter((section) => section.id !== optimisticId)
				}
			})
			.addCase(deleteSection.pending, (state, action) => {
				const { sectionId, spaceId } = action.meta.arg
				const spaceState = state.sectionsBySpace[spaceId]

				if (spaceState) {
					const sectionIndex = spaceState.sections.findIndex(
						(s) => s.id === sectionId,
					)
					if (sectionIndex !== -1) {
						const sections = [...spaceState.sections]
						sections.splice(sectionIndex, 1)

						const updatedSections = sections.map((section, index) => ({
							...section,
							order: index,
						}))

						spaceState.sections = updatedSections
					}
				}
			})
			.addCase(deleteSection.fulfilled, (state, action) => {
				const { spaceId, updatedSections } = action.payload
				if (state.sectionsBySpace[spaceId]) {
					state.sectionsBySpace[spaceId].sections = updatedSections
				}
			})
			.addCase(deleteSection.rejected, (state, action) => {
				const { spaceId } = action.meta.arg
				if (state.sectionsBySpace[spaceId]) {
					state.sectionsBySpace[spaceId].error =
						action.error.message || 'セクションの削除に失敗しました'
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
			.addCase(fetchSectionsWithResources.pending, (state, action) => {
				const spaceId = action.meta.arg
				state.sectionsBySpace[spaceId] = {
					sections: state.sectionsBySpace[spaceId]?.sections || [],
					loading: true,
					error: null,
					lastFetched: state.sectionsBySpace[spaceId]?.lastFetched || undefined,
				}
			})
			.addCase(fetchSectionsWithResources.fulfilled, (state, action) => {
				const { sections, spaceId, lastFetched } = action.payload
				console.log('Updating sections state:', {
					sections,
					spaceId,
					lastFetched,
				})
				state.sectionsBySpace[spaceId] = {
					sections,
					loading: false,
					error: null,
					lastFetched: lastFetched || Date.now(),
				}
			})
			.addCase(fetchSectionsWithResources.rejected, (state, action) => {
				const spaceId = action.meta.arg
				state.sectionsBySpace[spaceId] = {
					sections: [],
					loading: false,
					error: action.error.message || 'エラーが発生しました',
					lastFetched: undefined,
				}
			})
	},
})

export const {
	addSectionOptimistically,
	removeSectionOptimistically,
	renameSectionOptimistically,
} = sectionSlice.actions

export default sectionSlice.reducer
