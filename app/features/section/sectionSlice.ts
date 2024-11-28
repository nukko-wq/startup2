import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface Section {
	id: string
	name: string
	order: number
	spaceId: string
}

interface SectionState {
	sectionsBySpace: {
		[spaceId: string]: {
			sections: Section[]
			loading: boolean
			error: string | null
		}
	}
}

const initialState: SectionState = {
	sectionsBySpace: {},
}

export const fetchSections = createAsyncThunk(
	'section/fetchSections',
	async (spaceId: string) => {
		const response = await fetch(`/api/spaces/${spaceId}/sections`)
		if (!response.ok) {
			throw new Error('セクションの取得に失敗しました')
		}
		return response.json()
	},
)

export const createSection = createAsyncThunk(
	'section/createSection',
	async (spaceId: string) => {
		const response = await fetch(`/api/spaces/${spaceId}/sections`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: 'Resources',
			}),
		})

		if (!response.ok) {
			throw new Error('セクションの作成に失敗しました')
		}

		return response.json()
	},
)

export const deleteSection = createAsyncThunk(
	'section/deleteSection',
	async ({ sectionId, spaceId }: { sectionId: string; spaceId: string }) => {
		const response = await fetch(`/api/sections/${sectionId}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			throw new Error('セクションの削除に失敗しました')
		}

		return { sectionId, spaceId }
	},
)

export const renameSection = createAsyncThunk(
	'section/renameSection',
	async ({
		sectionId,
		name,
		spaceId,
	}: {
		sectionId: string
		name: string
		spaceId: string
	}) => {
		const response = await fetch(`/api/sections/${sectionId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name }),
		})

		if (!response.ok) {
			throw new Error('セクション名の変更に失敗しました')
		}

		const data = await response.json()
		return { section: data, spaceId }
	},
)

export const reorderSection = createAsyncThunk(
	'section/reorderSection',
	async ({
		sectionId,
		newOrder,
		spaceId,
	}: { sectionId: string; newOrder: number; spaceId: string }) => {
		const response = await fetch(`/api/sections/${sectionId}/reorder`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ order: newOrder }),
		})

		if (!response.ok) {
			throw new Error('セクションの並び替えに失敗しました')
		}

		const data = await response.json()
		return { section: data, spaceId }
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
				const newSection = action.payload
				const spaceId = newSection.spaceId
				const currentSections = state.sectionsBySpace[spaceId]?.sections || []

				state.sectionsBySpace[spaceId] = {
					sections: [...currentSections, newSection],
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
				const { section, spaceId } = action.payload
				const spaceState = state.sectionsBySpace[spaceId]

				if (spaceState) {
					spaceState.sections = spaceState.sections
						.map((s) => {
							if (s.id === section.id) return section
							if (s.order >= section.order && s.id !== section.id) {
								return { ...s, order: s.order + 1 }
							}
							return s
						})
						.sort((a, b) => a.order - b.order)
				}
			})
	},
})

export default sectionSlice.reducer
