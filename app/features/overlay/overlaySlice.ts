import { createSlice } from '@reduxjs/toolkit'

interface OverlayState {
	isSpaceListVisible: boolean
}

const initialState: OverlayState = {
	isSpaceListVisible: false,
}

const overlaySlice = createSlice({
	name: 'overlay',
	initialState,
	reducers: {
		showSpaceList: (state) => {
			state.isSpaceListVisible = true
		},
		hideSpaceList: (state) => {
			state.isSpaceListVisible = false
		},
	},
})

export const { showSpaceList, hideSpaceList } = overlaySlice.actions
export default overlaySlice.reducer
