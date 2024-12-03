import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { googleDriveApi } from '@/app/features/google-drive/api/googleDriveApi'
import type { GoogleDriveState } from '@/app/features/google-drive/types/googleDrive'

const initialState: GoogleDriveState = {
	files: [],
	loading: false,
	error: null,
}

export const fetchGoogleDriveFiles = createAsyncThunk(
	'googleDrive/fetchFiles',
	async (query?: string) => {
		const response = await googleDriveApi.fetchFiles(query)
		return response.files
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
