import { configureStore } from '@reduxjs/toolkit'
import workspaceReducer from '@/app/features/workspace/workspaceSlice'
import spaceReducer from '@/app/features/space/spaceSlice'

export const store = configureStore({
	reducer: {
		workspace: workspaceReducer,
		space: spaceReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
