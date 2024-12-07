'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '@/app/components/sidebar/Sidebar'
import SectionListWrapper from '@/app/features/section/components/SectionListWrapper'
import TabListWrapper from '@/app/features/tabs/components/TabListWrapper'
import Header from '@/app/components/header/Header'
import SpaceListOverlay from '@/app/features/space/components/SpaceListOverlay'
import { showSpaceList } from '@/app/features/overlay/overlaySlice'
import type { RootState } from '@/app/store/store'

export default function Home() {
	const dispatch = useDispatch()
	const isSpaceListVisible = useSelector(
		(state: RootState) => state.overlay.isSpaceListVisible,
	)

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
