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
	},
})

export default sectionSlice.reducer
