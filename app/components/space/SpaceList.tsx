'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import {
	fetchSpaces,
	setActiveSpace,
	reorderSpace,
	moveSpace,
} from '@/app/features/space/spaceSlice'
import { GripVertical } from 'lucide-react'
import {
	Button,
	DropIndicator,
	GridList,
	GridListItem,
	isTextDropItem,
	useDragAndDrop,
	type DroppableCollectionReorderEvent,
	type DroppableCollectionInsertDropEvent,
	type TextDropItem,
} from 'react-aria-components'
import SpaceMenu from '@/app/components/space/SpaceMenu'
import CreateSpaceInWorkspace from './CreateSpaceInWorkspace'

interface SpaceListProps {
	workspaceId: string
}

const SpaceList = ({ workspaceId }: SpaceListProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const workspaceSpaces = useSelector(
		(state: RootState) =>
			state.space.spacesByWorkspace[workspaceId] ?? {
				spaces: [],
				loading: false,
				error: null,
			},
	)
	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)

	useEffect(() => {
		if (workspaceId) {
			dispatch(fetchSpaces(workspaceId))
		}
	}, [dispatch, workspaceId])

	const handleSpaceClick = (spaceId: string) => {
		dispatch(setActiveSpace(spaceId))
	}

	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			const space = workspaceSpaces.spaces.find(
				(s) => s.id === Array.from(keys)[0],
			)
			if (!space) return []
			return [
				{
					'space-item': JSON.stringify({
						...space,
						workspaceId,
					}),
					'text/plain': space.name,
				},
			]
		},
		acceptedDragTypes: ['space-item'],
		getDropOperation: () => 'move',
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) => `
						drop-indicator
						${isDropTarget ? 'active' : ''}
					`}
				/>
			)
		},
		onReorder: async (e: DroppableCollectionReorderEvent) => {
			const draggedSpaceId = Array.from(e.keys)[0]
			const draggedSpace = workspaceSpaces.spaces.find(
				(s) => s.id === draggedSpaceId,
			)
			if (!draggedSpace) return

			const dropIndex =
				e.target.dropPosition === 'before'
					? workspaceSpaces.spaces.findIndex((s) => s.id === e.target.key)
					: workspaceSpaces.spaces.findIndex((s) => s.id === e.target.key) + 1

			const spacesWithoutDragged = workspaceSpaces.spaces.filter(
				(s) => s.id !== draggedSpaceId,
			)

			const reorderedSpaces = [
				...spacesWithoutDragged.slice(0, dropIndex),
				draggedSpace,
				...spacesWithoutDragged.slice(dropIndex),
			]

			const updatedOrders = reorderedSpaces.map((space, index) => ({
				spaceId: space.id,
				newOrder: index,
			}))

			try {
				await dispatch(
					reorderSpace({
						spaceId: draggedSpace.id,
						workspaceId,
						newOrder:
							updatedOrders.find((s) => s.spaceId === draggedSpace.id)
								?.newOrder ?? 0,
						allOrders: updatedOrders,
					}),
				).unwrap()
			} catch (error) {
				console.error('Failed to reorder space:', error)
			}
		},
		onInsert: async (e: DroppableCollectionInsertDropEvent) => {
			const item = e.items[0] as TextDropItem
			if (!item.types.has('space-item')) return

			try {
				const spaceData = JSON.parse(await item.getText('space-item'))
				const targetIndex = e.target.key
					? workspaceSpaces.spaces.findIndex((s) => s.id === e.target.key) +
						(e.target.dropPosition === 'after' ? 1 : 0)
					: workspaceSpaces.spaces.length

				if (spaceData.workspaceId === workspaceId) return

				await dispatch(
					moveSpace({
						spaceId: spaceData.id,
						sourceWorkspaceId: spaceData.workspaceId,
						targetWorkspaceId: workspaceId,
						newOrder: targetIndex,
					}),
				).unwrap()

				await Promise.all([
					dispatch(fetchSpaces(workspaceId)),
					dispatch(fetchSpaces(spaceData.workspaceId)),
				])
			} catch (error) {
				console.error('Failed to move space:', error)
			}
		},
		async onRootDrop(e) {
			const item = e.items[0]
			if (item.kind !== 'text') return

			try {
				const spaceItemText = await item.getText('space-item')
				if (!spaceItemText) return

				const spaceData = JSON.parse(spaceItemText)
				if (spaceData.workspaceId === workspaceId) return

				await dispatch(
					moveSpace({
						spaceId: spaceData.id,
						sourceWorkspaceId: spaceData.workspaceId,
						targetWorkspaceId: workspaceId,
						newOrder: 0,
					}),
				).unwrap()

				await Promise.all([
					dispatch(fetchSpaces(workspaceId)),
					dispatch(fetchSpaces(spaceData.workspaceId)),
				])
			} catch (error) {
				console.error('Failed to move space:', error)
			}
		},
	})

	if (workspaceSpaces.error)
		return <div className="text-zinc-50">{workspaceSpaces.error}</div>

	return (
		<GridList
			aria-label="Spaces"
			items={workspaceSpaces.spaces}
			dragAndDropHooks={dragAndDropHooks}
			selectionMode="single"
			className="flex flex-col outline-none min-h-[40px]"
			renderEmptyState={() => (
				<div className="ml-11 mr-4">
					<CreateSpaceInWorkspace workspaceId={workspaceId} />
				</div>
			)}
		>
			{(space) => (
				<GridListItem
					key={space.id}
					className={`
						flex flex-grow justify-between text-gray-400 outline-none cursor-pointer 
						hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200 
						${
							activeSpaceId === space.id
								? 'bg-gray-700 border-l-4 border-blue-500 pl-3'
								: 'pl-4'
						}
					`}
					onAction={() => handleSpaceClick(space.id)}
				>
					<div className="flex flex-grow items-center justify-between py-1 group">
						<div className="flex items-center flex-grow">
							<div className="flex items-center cursor-grab">
								<Button
									slot="drag"
									className="cursor-grab flex items-center pr-3"
									area-label="drag handle"
								>
									<GripVertical className="w-4 h-4 text-zinc-500" />
								</Button>
							</div>
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
