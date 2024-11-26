'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchSpaces } from '@/app/features/space/spaceSlice'
import { ChevronRight, GripVertical } from 'lucide-react'
import { Button, GridList, GridListItem } from 'react-aria-components'
import SpaceMenu from '@/app/components/space/SpaceMenu'

interface SpaceListProps {
	workspaceId: string
}

const SpaceList = ({ workspaceId }: SpaceListProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const workspaceSpaces = useSelector(
		(state: RootState) =>
			state.space.spacesByWorkspace[workspaceId] || {
				spaces: [],
				loading: false,
				error: null,
			},
	)

	useEffect(() => {
		if (workspaceId) {
			dispatch(fetchSpaces(workspaceId))
		}
	}, [dispatch, workspaceId])

	/*
	if (workspaceSpaces.loading)
		return <div className="text-zinc-50">読み込み中...</div>
	*/
	if (workspaceSpaces.error)
		return <div className="text-zinc-50">{workspaceSpaces.error}</div>

	console.log('workspaceSpaces:', workspaceSpaces)

	return (
		<GridList
			aria-label="Spaces"
			items={workspaceSpaces.spaces}
			className="flex flex-col outline-none"
		>
			{(space) => (
				<GridListItem
					key={space.id}
					className="flex flex-grow justify-between text-gray-400 outline-none cursor-pointer hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200"
				>
					<div className="flex flex-grow items-center justify-between py-1 group">
						<div className="flex items-center cursor-grab">
							<div className="flex items-center gap-2">
								<Button className="cursor-grab flex items-center pr-3">
									<GripVertical className="w-4 h-4 text-zinc-500" />
								</Button>
							</div>
							<Button className="rounded-full p-1">
								<ChevronRight className="w-4 h-4 text-zinc-500" />
							</Button>
							<Button className="text-left outline-none text-sm">
								{space.name}
							</Button>
						</div>
						<div className="opacity-0 group-hover:opacity-100">
							<SpaceMenu spaceId={space.id} workspaceId={workspaceId} />
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
}

export default SpaceList
