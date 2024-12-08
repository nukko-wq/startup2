'use client'

import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchAllSpaces, setActiveSpace } from '@/app/features/space/spaceSlice'
import { hideSpaceList } from '@/app/features/overlay/overlaySlice'
import { Overlay, useModalOverlay } from 'react-aria'
import { useOverlayTriggerState } from 'react-stately'
import type { Selection } from '@react-types/shared'

const SpaceListOverlay = () => {
	const dispatch = useDispatch<AppDispatch>()
	const { spaces, loading, error } = useSelector(
		(state: RootState) => state.space.allSpaces,
	)
	const ref = useRef<HTMLDivElement>(null)
	const [currentIndex, setCurrentIndex] = useState(0)
	const state = useOverlayTriggerState({
		isOpen: true,
		onOpenChange: (isOpen) => {
			if (!isOpen) {
				dispatch(hideSpaceList())
			}
		},
	})

	const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))

	const { modalProps, underlayProps } = useModalOverlay(
		{
			isDismissable: true,
		},
		state,
		ref,
	)

	const handleKeyDown = (e: React.KeyboardEvent) => {
		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault()
				setCurrentIndex((prev) => Math.min(prev + 1, spaces.length - 1))
				setSelectedKeys(
					new Set([spaces[Math.min(currentIndex + 1, spaces.length - 1)].id]),
				)
				break
			}
			case 'ArrowUp': {
				e.preventDefault()
				setCurrentIndex((prev) => Math.max(prev - 1, 0))
				setSelectedKeys(new Set([spaces[Math.max(currentIndex - 1, 0)].id]))
				break
			}
			case 'Enter': {
				e.preventDefault()
				const selectedId = spaces[currentIndex].id
				dispatch(setActiveSpace(String(selectedId)))
				state.close()
				break
			}
			case 'Escape': {
				e.preventDefault()
				state.close()
				break
			}
		}
	}

	useEffect(() => {
		dispatch(fetchAllSpaces())
	}, [dispatch])

	useEffect(() => {
		if (spaces.length > 0) {
			setSelectedKeys(new Set([spaces[0].id]))
			setCurrentIndex(0)
		}
	}, [spaces])

	useEffect(() => {
		if (ref.current && spaces.length > 0) {
			const firstItem = ref.current.querySelector('button')
			if (firstItem instanceof HTMLElement) {
				setTimeout(() => {
					firstItem.focus()
				}, 0)
			}
		}
	}, [spaces])

	const handleSelectionChange = (keys: Selection) => {
		setSelectedKeys(keys)
		const selectedId = [...keys][0]
		if (selectedId) {
			dispatch(setActiveSpace(String(selectedId)))
			state.close()
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
						onKeyDown={handleKeyDown}
						tabIndex={-1}
					>
						<div className="w-[320px]">
							{spaces.map((space, index) => (
								<button
									type="button"
									key={space.id}
									onClick={() => {
										setCurrentIndex(index)
										handleSelectionChange(new Set([space.id]))
									}}
									tabIndex={index === currentIndex ? 0 : -1}
									className={`
										w-full px-4 py-2
										flex items-center h-10 outline-none cursor-pointer 
										hover:text-white hover:bg-slate-700 
										first:rounded-t-lg last:rounded-b-lg
										${
											selectedKeys === 'all' ||
											(
												selectedKeys instanceof Set &&
													selectedKeys.has(space.id)
											)
												? 'bg-slate-700 text-white'
												: ''
										}
									`}
								>
									{space.name}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</Overlay>
	)
}

export default SpaceListOverlay
