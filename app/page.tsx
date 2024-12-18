'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWorkspaces } from '@/app/features/workspace/workspaceSlice'
import { fetchAllSpaces } from '@/app/features/space/spaceSlice'
import type { AppDispatch } from '@/app/store/store'
import Sidebar from '@/app/components/sidebar/Sidebar'
import SectionListWrapper from '@/app/features/section/components/SectionListWrapper'
import TabListWrapper from '@/app/features/tabs/components/TabListWrapper'
import Header from '@/app/components/header/Header'
import SpaceListOverlay from '@/app/features/space/components/SpaceListOverlay'
import { showSpaceList } from '@/app/features/overlay/overlaySlice'
import type { RootState } from '@/app/store/store'
import { fetchSectionsWithResources } from '@/app/features/section/sectionSlice'
import { store } from '@/app/store/store'
import { persistor } from '@/app/store/store'
import { measurePerformance } from './features/performance/performance'

export default function Home() {
	const dispatch = useDispatch<AppDispatch>()
	const [initialLoaded, setInitialLoaded] = useState(false)
	const isSpaceListVisible = useSelector(
		(state: RootState) => state.overlay.isSpaceListVisible,
	)
	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)

	const prefetchRelatedSpaces = useCallback(() => {
		dispatch(fetchAllSpaces())
	}, [dispatch])

	useEffect(() => {
		if (!initialLoaded) {
			setInitialLoaded(true)
			console.log('Initial loading started')
			// キャッシュチェックを追加
			const state = store.getState() as RootState
			const hasValidCache =
				state.workspace.lastFetched &&
				Date.now() - state.workspace.lastFetched < 5 * 60 * 1000

			if (hasValidCache) {
				console.log('Using cached workspaces')
				dispatch(fetchAllSpaces()).then(() => {
					const currentActiveSpaceId = state.space.activeSpaceId
					if (currentActiveSpaceId) {
						return dispatch(fetchSectionsWithResources(currentActiveSpaceId))
					}
				})
				return
			}

			// キャッシュがない場合は通常のフローを実行
			dispatch(fetchWorkspaces())
				.unwrap()
				.then(() => {
					console.log('Workspaces fetched')
					return dispatch(fetchAllSpaces())
				})
				.then(() => {
					console.log('All spaces fetched')
					// activeSpaceIdが存在する場合、セクションを取得
					const state = store.getState() as RootState
					const currentActiveSpaceId = state.space.activeSpaceId
					if (currentActiveSpaceId) {
						console.log(
							'Fetching sections for active space:',
							currentActiveSpaceId,
						)
						return dispatch(fetchSectionsWithResources(currentActiveSpaceId))
					}
				})
				.catch((error) => {
					console.error('Error during initial load:', error)
				})
		}
	}, [initialLoaded, dispatch])

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (
				event.data.source === 'startup-extension' &&
				event.data.type === 'SHOW_SPACE_LIST_OVERLAY'
			) {
				console.log('Received SHOW_SPACE_LIST_OVERLAY message')
				dispatch(showSpaceList())
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [dispatch])

	useEffect(() => {
		if (activeSpaceId) {
			const loadSpaceData = async () => {
				const endMeasure = measurePerformance('Space Switch Operation')

				// 優先度の高いデータを先に取得
				await dispatch(fetchSectionsWithResources(activeSpaceId))
				endMeasure()

				// 関連データは後で非同期に取得
				setTimeout(() => {
					prefetchRelatedSpaces()
				}, 0)
			}

			loadSpaceData()
		}
	}, [activeSpaceId, dispatch, prefetchRelatedSpaces])

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			// Ctrl + Shift + Q でキャッシュクリア
			if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
				persistor?.purge()
				console.log('Redux cache cleared')
			}
			// Ctrl + Shift + R でデータ再取得
			if (e.ctrlKey && e.shiftKey && e.key === 'R') {
				dispatch(fetchWorkspaces())
				console.log('Data refreshed')
			}
		}

		window.addEventListener('keydown', handleKeyPress)
		return () => window.removeEventListener('keydown', handleKeyPress)
	}, [dispatch])

	// useEffect(() => {
	// 	if (process.env.NODE_ENV === 'development') {
	// 		const handleKeyPress = (e: KeyboardEvent) => {
	// 			// Ctrl + Shift + Q でキャッシュクリア
	// 			if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
	// 				persistor?.purge()
	// 				console.log('Redux cache cleared')
	// 			}
	// 			// Ctrl + Shift + R でデータ再取得
	// 			if (e.ctrlKey && e.shiftKey && e.key === 'R') {
	// 				dispatch(fetchWorkspaces())
	// 				console.log('Data refreshed')
	// 			}
	// 		}

	// 		window.addEventListener('keydown', handleKeyPress)
	// 		return () => window.removeEventListener('keydown', handleKeyPress)
	// 	}
	// }, [dispatch])

	// サーバーサイドレンダリング時は最小限のレイアウトを返す
	if (!initialLoaded) {
		return (
			<div className="flex w-full h-full">
				<div className="flex flex-col w-full h-full">
					<div className="grid grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr] bg-slate-50">
						{/* ローディング状態やスケルトンUIを表示 */}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex w-full h-full">
			<div className="flex flex-col w-full h-full">
				<div className="grid grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr] bg-slate-50">
					<Sidebar />
					<main className="flex flex-col flex-grow items-center bg-slate-100">
						<Header />
						<div className="flex flex-grow w-full h-[calc(100vh-68px)]">
							<div className="flex justify-center w-1/2">
								<TabListWrapper />
							</div>
							<div className="flex justify-center w-1/2">
								<SectionListWrapper />
							</div>
						</div>
					</main>
				</div>
				{isSpaceListVisible && <SpaceListOverlay />}
			</div>
		</div>
	)
}
