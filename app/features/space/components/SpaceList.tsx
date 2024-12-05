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
import SpaceMenu from '@/app/features/space/components/SpaceMenu'
import CreateSpaceInWorkspace from '@/app/features/space/components/CreateSpaceInWorkspace'

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
		async onReorder(e) {
			try {
				const draggedSpaceId = Array.from(e.keys)[0]
				const targetSpaceId = e.target.key

				if (!workspaceSpaces?.spaces) {
					console.error('Workspace spaces is undefined or empty')
					return
				}

				const draggedSpace = workspaceSpaces.spaces.find(
					(s) => s.id === draggedSpaceId,
				)
				const targetSpace = workspaceSpaces.spaces.find(
					(s) => s.id === targetSpaceId,
				)

				if (!draggedSpace || !targetSpace) {
					console.error('Could not find dragged or target space', {
						draggedSpace,
						targetSpace,
						draggedSpaceId,
						targetSpaceId,
					})
					return
				}

				const orderedSpaces = [...workspaceSpaces.spaces].sort(
					(a, b) => a.order - b.order,
				)
				const draggedIndex = orderedSpaces.findIndex(
					(s) => s.id === draggedSpaceId,
				)
				const targetIndex = orderedSpaces.findIndex(
					(s) => s.id === targetSpaceId,
				)

				if (draggedIndex === -1 || targetIndex === -1) {
					console.error('Invalid index found', { draggedIndex, targetIndex })
					return
				}

				if (draggedIndex === targetIndex) {
					console.log('Same position, no reordering needed')
					return
				}

				const dropIndex =
					e.target.dropPosition === 'before'
						? targetSpace.order
						: targetSpace.order + 1

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

				const newOrder = updatedOrders.find(
					(s) => s.spaceId === draggedSpace.id,
				)?.newOrder

				if (typeof newOrder !== 'number') {
					console.error('Could not determine new order')
					return
				}

				await dispatch(
					reorderSpace({
						spaceId: draggedSpace.id,
						workspaceId,
						newOrder,
						allOrders: updatedOrders,
					}),
				).unwrap()
			} catch (error) {
				console.error('Failed to reorder space:', error)
				if (error instanceof Error) {
					console.error('Error details:', error.message, error.stack)
				}
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
		onDragStart: () => {
			document.body.classList.add('dragging')
		},
		onDragEnd: () => {
			document.body.classList.remove('dragging')
		},
	})

	if (workspaceSpaces.error)
		return <div className="text-zinc-50">{workspaceSpaces.error}</div>

	return (
		<>
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
						hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200 pl-3
						${
							activeSpaceId === space.id
								? 'bg-gray-700 border-l-4 border-blue-500'
								: 'border-l-4 border-transparent'
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
								<div className="text-left outline-none text-sm">
									{space.name}
								</div>
							</div>
							<div className="opacity-0 group-hover:opacity-100">
								<SpaceMenu spaceId={space.id} workspaceId={workspaceId} />
							</div>
						</div>
					</GridListItem>
				)}
			</GridList>

			{/* Space List Overlay */}
			<div className="fixed inset-0 z-50 bg-[#292f3d]/10 hidden">
				<div className="h-full bg-[#292f3d]/10">
					<div className="flex items-center justify-center h-full">
						<div
							className="flex flex-col justify-center items-center min-w-[320px] bg-zinc-50 text-zinc-800 border border-zinc-50 rounded-xl p-2 shadow-md"
							aria-label="Space List Overlay"
						>
							<div className="w-full h-10 inline-flex items-center hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200 rounded-md px-2">
								Space1
							</div>
							<div className="w-full h-10 inline-flex items-center hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200 rounded-md px-2">
								Space2
							</div>
							<div className="w-full h-10 inline-flex items-center hover:bg-gray-700 hover:bg-opacity-75 group transition duration-200 rounded-md px-2">
								Space3
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default SpaceList
