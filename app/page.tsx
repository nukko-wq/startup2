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

export default function Home() {
	const dispatch = useDispatch<AppDispatch>()
	const [isClient, setIsClient] = useState(false)
	const isSpaceListVisible = useSelector(
		(state: RootState) => state.overlay.isSpaceListVisible,
	)
	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)
	const activeSectionId = useSelector((state: RootState) => {
		if (!activeSpaceId) return null
		const spaceState = state.section.sectionsBySpace[activeSpaceId]
		return spaceState?.sections?.[0]?.id || null
	})

	// キャッシュ時間の管理
	const lastFetchTime = useRef<{ [spaceId: string]: number }>({})
	const CACHE_DURATION = 5 * 60 * 1000 // 5分

	useEffect(() => {
		if (!isClient) {
			setIsClient(true)
			Promise.all([dispatch(fetchWorkspaces()), dispatch(fetchAllSpaces())])
		}
	}, [dispatch, isClient])

	useEffect(() => {
		if (activeSpaceId) {
			const shouldFetch =
				!lastFetchTime.current[activeSpaceId] ||
				Date.now() - lastFetchTime.current[activeSpaceId] > CACHE_DURATION

			if (shouldFetch) {
				dispatch(fetchSectionsWithResources(activeSpaceId))
					.unwrap()
					.then(() => {
						lastFetchTime.current[activeSpaceId] = Date.now()
					})
			}
		}
	}, [dispatch, activeSpaceId])

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (
				event.data.source === 'startup-extension' &&
				event.data.type === 'SHOW_SPACE_LIST_OVERLAY'
			) {
				dispatch(showSpaceList())
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [dispatch])

	// サーバーサイドレンダリング時は最小限のレイアウトを返す
	if (!isClient) {
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
