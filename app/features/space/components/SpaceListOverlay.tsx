'use client'

import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchAllSpaces, setActiveSpace } from '@/app/features/space/spaceSlice'
import { hideSpaceList } from '@/app/features/overlay/overlaySlice'
import { GridList, GridListItem } from 'react-aria-components'
import { Overlay, useModalOverlay } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import type { Key } from '@react-types/shared'

const SpaceListOverlay = () => {
	const dispatch = useDispatch<AppDispatch>()
	const { spaces, loading, error } = useSelector(
		(state: RootState) => state.space.allSpaces,
	)
	const ref = useRef<HTMLDivElement>(null)
	const state = useOverlayTriggerState({
		isOpen: true,
		onOpenChange: (isOpen) => {
			if (!isOpen) {
				dispatch(hideSpaceList())
			}
		},
	})

	const { modalProps, underlayProps } = useModalOverlay(
		{
			isDismissable: true,
		},
		state,
		ref,
	)

	useEffect(() => {
		dispatch(fetchAllSpaces())

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				dispatch(hideSpaceList())
			}
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [dispatch])

	const handleSpaceSelect = (spaceId: Key) => {
		if (typeof spaceId === 'string') {
			dispatch(setActiveSpace(spaceId))
			dispatch(hideSpaceList())
		}
	}

	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error}</div>
	if (!spaces.length) return null

	return (
		<Overlay>
			<div className="fixed inset-0 z-50 bg-slate-900/30" {...underlayProps}>
				<div className="flex h-full items-center justify-center">
					<div
						{...modalProps}
						ref={ref}
						className="bg-zinc-50 rounded-xl shadow-lg outline-none"
					>
						<GridList
							aria-label="Spaces Overlay"
							items={spaces}
							className="flex flex-col justify-center w-[320px]"
							selectionMode="single"
							onAction={handleSpaceSelect}
							autoFocus="first"
						>
							{(space) => (
								<GridListItem
									key={space.id}
									id={space.id}
									className={({ isFocused }) => `
										flex items-center h-10 outline-none cursor-pointer 
										hover:text-white hover:bg-slate-700 
										first:rounded-t-lg last:rounded-b-lg
										${isFocused ? 'bg-slate-700 text-white' : ''}
									`}
									textValue={space.name}
								>
									<div className="px-4">{space.name}</div>
								</GridListItem>
							)}
						</GridList>
					</div>
				</div>
			</div>
		</Overlay>
	)
}

export default SpaceListOverlay
