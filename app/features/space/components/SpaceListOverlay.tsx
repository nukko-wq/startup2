'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchAllSpaces, setActiveSpace } from '@/app/features/space/spaceSlice'
import { GridList, GridListItem } from 'react-aria-components'

const SpaceListOverlay = () => {
	const dispatch = useDispatch<AppDispatch>()
	const { spaces, loading, error } = useSelector(
		(state: RootState) => state.space.allSpaces,
	)

	useEffect(() => {
		dispatch(fetchAllSpaces())
	}, [dispatch])

	const handleSpaceSelect = (spaceId: string) => {
		dispatch(setActiveSpace(spaceId))
	}

	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error}</div>
	if (!spaces.length) return null

	return (
		<div className="fixed inset-0 z-50 bg-slate-900/30">
			<div className="flex h-full">
				<div className="flex flex-grow items-center justify-center h-full">
					<GridList
						aria-label="Spaces Overlay"
						items={spaces}
						className="flex flex-col justify-center w-[320px] bg-zinc-50 rounded-xl shadow-lg"
					>
						{(space) => (
							<GridListItem
								key={space.id}
								className="flex items-center h-10 outline-none cursor-pointer hover:text-white hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg"
								onAction={() => handleSpaceSelect(space.id)}
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
