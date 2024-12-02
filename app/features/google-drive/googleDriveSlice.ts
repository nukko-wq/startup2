import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface GoogleDriveFile {
	id: string
	name: string
	webViewLink: string
	mimeType: string
}

interface GoogleDriveState {
	files: GoogleDriveFile[]
	loading: boolean
	error: string | null
}

const initialState: GoogleDriveState = {
	files: [],
	loading: false,
	error: null,
}

export const fetchGoogleDriveFiles = createAsyncThunk(
	'googleDrive/fetchFiles',
	async (query?: string) => {
		const url = query
			? `/api/googleapis?q=${encodeURIComponent(query)}`
			: '/api/googleapis'
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error('Google Driveファイルの取得に失敗しました')
		}
		const data = await response.json()
		return data.files
	},
)

const googleDriveSlice = createSlice({
	name: 'googleDrive',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchGoogleDriveFiles.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchGoogleDriveFiles.fulfilled, (state, action) => {
				state.files = action.payload
				state.loading = false
			})
			.addCase(fetchGoogleDriveFiles.rejected, (state, action) => {
				state.loading = false
				state.error = action.error.message || 'エラーが発生しました'
			})
	},
})

export default googleDriveSlice.reducer
