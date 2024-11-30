import { GripVertical } from 'lucide-react'
import React, { useEffect } from 'react'
import {
	Button,
	DropIndicator,
	GridList,
	GridListItem,
	useDragAndDrop,
	type TextDropItem,
} from 'react-aria-components'
import type {
	DroppableCollectionInsertDropEvent,
	DroppableCollectionReorderEvent,
} from '@react-types/shared'
import ResourceIcon from '@/app/components/elements/ResourceIcon'
import ResourceDeleteButton from './ResourceDeleteButton'
import ResourceMenu from './ResourceMenu'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import {
	fetchResources,
	reorderResource,
	moveResource,
} from '@/app/features/resource/resourceSlice'
import type { Resource } from '@prisma/client'

interface ResourceListProps {
	sectionId: string
}

const ResourceList = ({ sectionId }: ResourceListProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const { resources, loading, error } = useSelector(
		(state: RootState) =>
			state.resource.resourcesBySection[sectionId] || {
				resources: [],
				loading: false,
				error: null,
			},
	)

	useEffect(() => {
		dispatch(fetchResources(sectionId))
	}, [dispatch, sectionId])

	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			const resource = resources.find((r) => r.id === Array.from(keys)[0])
			if (!resource) return []
			return [
				{
					'resource-item': JSON.stringify({
						...resource,
						sectionId,
					}),
					'text/plain': resource.title,
				},
			]
		},
		acceptedDragTypes: ['resource-item'],
		getDropOperation: () => 'move',
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) =>
						`drop-indicator ${isDropTarget ? 'active' : ''}`
					}
				/>
			)
		},
		onReorder: async (e: DroppableCollectionReorderEvent) => {
			const draggedResourceId = Array.from(e.keys)[0]
			const draggedResource = resources.find((r) => r.id === draggedResourceId)
			if (!draggedResource) return

			// ドロップ位置の計算
			const dropIndex =
				e.target.dropPosition === 'before'
					? resources.findIndex((r) => r.id === e.target.key)
					: resources.findIndex((r) => r.id === e.target.key) + 1

			// ドラッグ中のリソースを除いた配列を作成
			const resourcesWithoutDragged = resources.filter(
				(r) => r.id !== draggedResourceId,
			)

			// 新しい配列を作成（ドロップ位置にドラッグしたリソースを挿入）
			const reorderedResources = [
				...resourcesWithoutDragged.slice(0, dropIndex),
				draggedResource,
				...resourcesWithoutDragged.slice(dropIndex),
			]

			// 各リソースの新しいorder値を計算（インデックスベース）
			const updatedOrders = reorderedResources.map((resource, index) => ({
				resourceId: resource.id,
				newOrder: index,
			}))

			try {
				// ドラッグしたリソースの順序を更新
				await dispatch(
					reorderResource({
						resourceId: draggedResource.id,
						sectionId,
						newOrder:
							updatedOrders.find((r) => r.resourceId === draggedResource.id)
								?.newOrder ?? 0,
						allOrders: updatedOrders, // 全てのリソースの新しい順序情報
					}),
				).unwrap()
			} catch (error) {
				console.error('Failed to reorder resource:', error)
			}
		},
		onInsert: async (e: DroppableCollectionInsertDropEvent) => {
			const item = e.items[0] as TextDropItem
			if (!item.types.has('resource-item')) return

			try {
				const resourceData = JSON.parse(await item.getText('resource-item'))
				const targetIndex = e.target.key
					? resources.findIndex((r) => r.id === e.target.key) +
						(e.target.dropPosition === 'after' ? 1 : 0)
					: resources.length

				// 同じセクション内での移動は無視
				if (resourceData.sectionId === sectionId) return

				// リソースの移動を実行
				await dispatch(
					moveResource({
						resourceId: resourceData.id,
						targetSectionId: sectionId,
						newOrder: targetIndex,
					}),
				).unwrap()

				// 両方のセクションのリソースを再取得
				await Promise.all([
					dispatch(fetchResources(sectionId)),
					dispatch(fetchResources(resourceData.sectionId)),
				])
			} catch (error) {
				console.error('Failed to move resource:', error)
			}
		},
	})

	// 新しい順序を計算するヘルパー関数
	const calculateNewOrder = (items: Resource[], targetIndex: number) => {
		if (items.length === 0) return 0
		if (targetIndex === 0) return items[0].order / 2
		if (targetIndex >= items.length) return items[items.length - 1].order + 1
		const prevOrder = items[targetIndex - 1].order
		const nextOrder = items[targetIndex].order
		return prevOrder + (nextOrder - prevOrder) / 2
	}

	/*
	if (loading) {
		return <div>読み込み中...</div>
	}
	*/

	if (error) {
		return <div>エラー: {error}</div>
	}

	return (
		<GridList
			aria-label="Resources in section"
			items={resources}
			className="flex flex-col justify-center border-slate-400 rounded-md outline-none bg-white shadow-sm"
			dragAndDropHooks={dragAndDropHooks}
			renderEmptyState={() => (
				<div className="flex flex-col justify-center items-center flex-grow h-[52px]">
					<div className="text-gray-500">Add resources here</div>
				</div>
			)}
		>
			{(resource) => (
				<GridListItem
					key={resource.id}
					id={resource.id}
					textValue={resource.title}
					className="flex flex-grow flex-col outline-none cursor-pointer group/item"
					data-resource={JSON.stringify(resource)}
				>
					<div className="grid grid-cols-[32px_1fr_74px] items-center px-1 pt-1 pb-2 border-b border-zinc-200 last:border-b-0 hover:bg-zinc-100">
						<div
							className="cursor-grab flex items-center p-2 opacity-0 group-hover/item:opacity-100"
							aria-label="Drag Wrapper"
						>
							<Button
								className="cursor-grab"
								slot="drag"
								aria-label="ドラッグハンドル"
							>
								<GripVertical className="w-4 h-4 text-zinc-500" />
							</Button>
						</div>
						<div className="flex items-end gap-2 truncate">
							<ResourceIcon
								faviconUrl={resource.faviconUrl}
								mimeType={resource.mimeType}
								isGoogleDrive={resource.isGoogleDrive}
							/>
							<div className="flex flex-col truncate">
								<span className="truncate">{resource.title}</span>
								<span className="text-xs text-muted-foreground">
									{resource.description || 'Webpage'}
								</span>
							</div>
						</div>
						<div className="flex items-center opacity-0 group-hover/item:opacity-100">
							<ResourceMenu resource={resource} />
							<ResourceDeleteButton resourceId={resource.id} />
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
}

export default ResourceList
