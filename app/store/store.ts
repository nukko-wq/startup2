import { configureStore } from '@reduxjs/toolkit'
import storage from 'redux-persist/lib/storage'
import {
	persistReducer,
	persistStore,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist'
import workspaceReducer from '@/app/features/workspace/workspaceSlice'
import spaceReducer from '@/app/features/space/spaceSlice'
import sectionReducer from '@/app/features/section/sectionSlice'
import resourceReducer from '@/app/features/resource/resourceSlice'
import googleDriveReducer from '@/app/features/google-drive/googleDriveSlice'
import tabsReducer from '@/app/features/tabs/tabsSlice'
import overlayReducer from '@/app/features/overlay/overlaySlice'
import { combineReducers } from '@reduxjs/toolkit'

const persistConfig = {
	key: 'root',
	storage,
	whitelist: [
		'workspace',
		'space',
		'section',
		'resource',
		'googleDrive',
		'tabs',
	],
}

const persistedReducer = persistReducer(
	persistConfig,
	combineReducers({
		workspace: workspaceReducer,
		space: spaceReducer,
		section: sectionReducer,
		resource: resourceReducer,
		googleDrive: googleDriveReducer,
		tabs: tabsReducer,
		overlay: overlayReducer,
	}),
)

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
