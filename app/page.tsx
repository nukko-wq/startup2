'use client'

import { useEffect, useState, useRef } from 'react'
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

export default function Home() {
	const dispatch = useDispatch<AppDispatch>()
	const [initialLoaded, setInitialLoaded] = useState(false)
	const isSpaceListVisible = useSelector(
		(state: RootState) => state.overlay.isSpaceListVisible,
	)
	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)

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
			// アクティブなスペースのデータを即時取得
			dispatch(fetchSectionsWithResources(activeSpaceId))

			// 関連するスペースのデータを優先度付きでプリフェッチ
			const prefetchRelatedSpaces = async () => {
				const state = store.getState()
				const currentWorkspace = state.workspace.workspaces.find((workspace) =>
					workspace?.spaces?.some?.((space) => space.id === activeSpaceId),
				)

				// 最近アクセスしたスペースを優先的にプリフェッチ
				const recentSpaces = state.space.recentSpaces || []
				const relatedSpaces = [
					...new Set([...recentSpaces, ...(currentWorkspace?.spaces || [])]),
				].slice(0, 5)

				// 優先度の高いスペースから順にフェッチ
				for (const space of relatedSpaces) {
					if (space.id !== activeSpaceId) {
						await dispatch(fetchSectionsWithResources(space.id))
						await new Promise((resolve) => setTimeout(resolve, 100)) // レート制限回避
					}
				}
			}

			prefetchRelatedSpaces()
		}
	}, [activeSpaceId, dispatch])

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
						<div className="flex flex-grow w-full">
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
