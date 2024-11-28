import { configureStore } from '@reduxjs/toolkit'
import workspaceReducer from '@/app/features/workspace/workspaceSlice'
import spaceReducer from '@/app/features/space/spaceSlice'
import sectionReducer from '@/app/features/section/sectionSlice'
import resourceReducer from '@/app/features/resource/resourceSlice'

export const store = configureStore({
	reducer: {
		workspace: workspaceReducer,
		space: spaceReducer,
		section: sectionReducer,
		resource: resourceReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
