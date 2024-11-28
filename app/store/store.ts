import { configureStore } from '@reduxjs/toolkit'
import workspaceReducer from '@/app/features/workspace/workspaceSlice'
import spaceReducer from '@/app/features/space/spaceSlice'
import sectionReducer from '@/app/features/section/sectionSlice'
import resourceReducer from '@/app/features/resource/resourceSlice'
import googleDriveReducer from '@/app/features/googleDrive/googleDriveSlice'
import tabsReducer from '@/app/features/tabs/tabsSlice'

export const store = configureStore({
	reducer: {
		workspace: workspaceReducer,
		space: spaceReducer,
		section: sectionReducer,
		resource: resourceReducer,
		googleDrive: googleDriveReducer,
		tabs: tabsReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
