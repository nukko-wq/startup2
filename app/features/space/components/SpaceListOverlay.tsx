'use client'

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchAllSpaces, setActiveSpace } from '@/app/features/space/spaceSlice'
import { hideSpaceList } from '@/app/features/overlay/overlaySlice'
import { GridList, GridListItem } from 'react-aria-components'

const SpaceListOverlay = () => {
	const dispatch = useDispatch<AppDispatch>()
	const { spaces, loading, error } = useSelector(
		(state: RootState) => state.space.allSpaces,
	)
	const gridListRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		dispatch(fetchAllSpaces())
	}, [dispatch])

	useEffect(() => {
		// オーバーレイが表示されたら最初の要素にフォーカス
		if (gridListRef.current) {
			const firstItem = gridListRef.current.querySelector('[role="gridcell"]')
			if (firstItem instanceof HTMLElement) {
				firstItem.focus()
			}
		}
	}, [])

	const handleSpaceSelect = (spaceId: string) => {
		dispatch(setActiveSpace(spaceId))
		dispatch(hideSpaceList())
	}

	const handleBackdropClick = () => {
		dispatch(hideSpaceList())
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			dispatch(hideSpaceList())
		}
	}

	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error}</div>
	if (!spaces.length) return null

	return (
		<div
			className="fixed inset-0 z-50 bg-slate-900/30"
			onClick={handleBackdropClick}
			onKeyDown={handleKeyDown}
		>
			<div className="flex h-full">
				<div className="flex flex-grow items-center justify-center h-full">
					<GridList
						ref={gridListRef}
						aria-label="Spaces Overlay"
						items={spaces}
						className="flex flex-col justify-center w-[320px] bg-zinc-50 rounded-xl shadow-lg"
						selectionMode="single"
					>
						{(space) => (
							<GridListItem
								key={space.id}
								className={({ isFocused }) => `
									flex items-center h-10 outline-none cursor-pointer 
									hover:text-white hover:bg-slate-700 
									first:rounded-t-lg last:rounded-b-lg
									${isFocused ? 'bg-slate-700 text-white' : ''}
								`}
								onAction={() => handleSpaceSelect(space.id)}
								textValue={space.name}
							>
								<div className="px-4">{space.name}</div>
							</GridListItem>
						)}
					</GridList>
				</div>
			</div>
		</div>
	)
}

export default SpaceListOverlay
