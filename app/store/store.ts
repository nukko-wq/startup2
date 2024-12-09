import { configureStore } from '@reduxjs/toolkit'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'
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
import { normalize, schema } from 'normalizr'

interface StorageInterface {
	getItem(key: string): Promise<string | null>
	setItem(key: string, value: string): Promise<void>
	removeItem(key: string): Promise<void>
}

const createNoopStorage = (): StorageInterface => {
	return {
		getItem(_key) {
			return Promise.resolve(null)
		},
		setItem(_key, _value) {
			return Promise.resolve()
		},
		removeItem(_key) {
			return Promise.resolve()
		},
	}
}

const storage =
	typeof window !== 'undefined'
		? createWebStorage('local')
		: createNoopStorage()

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
	debug: process.env.NODE_ENV === 'development',
}

const rootReducer = combineReducers({
	workspace: workspaceReducer,
	space: spaceReducer,
	section: sectionReducer,
	resource: resourceReducer,
	googleDrive: googleDriveReducer,
	tabs: tabsReducer,
	overlay: overlayReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
	devTools: process.env.NODE_ENV !== 'production',
})

export const persistor =
	typeof window !== 'undefined' ? persistStore(store) : null

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

const resourceSchema = new schema.Entity('resources')
const sectionSchema = new schema.Entity('sections', {
	resources: [resourceSchema],
})

const normalizedInitialState = {
	entities: {
		resources: {},
		sections: {},
	},
	result: [],
}
