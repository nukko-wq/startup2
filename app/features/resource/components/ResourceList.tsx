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
	createResource,
} from '@/app/features/resource/resourceSlice'
import type { Resource } from '@prisma/client'
import { sendMessageToExtension } from '@/app/features/tabs/tabsSlice'

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
		acceptedDragTypes: ['resource-item', 'tab-item'],
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
			try {
				const draggedResourceId = Array.from(e.keys)[0]
				const targetResourceId = e.target.key

				const draggedResource = resources.find(
					(r) => r.id === draggedResourceId,
				)
				const targetResource = resources.find((r) => r.id === targetResourceId)

				if (!draggedResource || !targetResource) {
					console.error('Could not find dragged or target resource')
					return
				}

				const orderedResources = [...resources].sort(
					(a, b) => a.order - b.order,
				)
				const draggedIndex = orderedResources.findIndex(
					(r) => r.id === draggedResourceId,
				)
				const targetIndex = orderedResources.findIndex(
					(r) => r.id === targetResourceId,
				)

				// 同じ位置の場合は何もしない
				if (draggedIndex === targetIndex) {
					console.log('Same position, no reordering needed')
					return
				}

				const dropIndex =
					e.target.dropPosition === 'before'
						? targetResource.order
						: targetResource.order + 1

				const resourcesWithoutDragged = resources.filter(
					(r) => r.id !== draggedResourceId,
				)

				const reorderedResources = [
					...resourcesWithoutDragged.slice(0, dropIndex),
					draggedResource,
					...resourcesWithoutDragged.slice(dropIndex),
				]

				const updatedOrders = reorderedResources.map((resource, index) => ({
					resourceId: resource.id,
					newOrder: index,
				}))

				await dispatch(
					reorderResource({
						resourceId: draggedResource.id,
						sectionId,
						newOrder:
							updatedOrders.find((r) => r.resourceId === draggedResource.id)
								?.newOrder ?? 0,
						allOrders: updatedOrders,
					}),
				).unwrap()
			} catch (error) {
				console.error('Failed to reorder resource:', error)
			}
		},
		onInsert: async (e: DroppableCollectionInsertDropEvent) => {
			const item = e.items[0] as TextDropItem

			try {
				if (item.types.has('resource-item')) {
					// 既存のリソース移動ロジック
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
				} else if (item.types.has('tab-item')) {
					const tabData = JSON.parse(await item.getText('tab-item'))

					// 既存のリソースをorderでソート
					const orderedResources = [...resources].sort(
						(a, b) => a.order - b.order,
					)

					// ドロップ先のリソースを特定
					const targetResource = e.target.key
						? resources.find((r) => r.id === e.target.key)
						: null

					let newOrder: number

					if (!targetResource) {
						// セクションが空または最後に追加する場合
						newOrder =
							orderedResources.length > 0
								? orderedResources[orderedResources.length - 1].order + 1
								: 0
					} else {
						if (e.target.dropPosition === 'before') {
							newOrder = targetResource.order
						} else {
							// 'after'
							newOrder = targetResource.order + 1
						}
					}

					// リソースを作成
					await dispatch(
						createResource({
							title: tabData.title,
							url: tabData.url,
							faviconUrl: tabData.faviconUrl,
							sectionId: sectionId,
							order: newOrder,
							mimeType: 'text/html',
							description: '',
							isGoogleDrive: false,
						}),
					).unwrap()

					// リソースリストを再取得して更新
					await dispatch(fetchResources(sectionId))
				}
			} catch (error) {
				console.error('Failed to handle drop:', error)
			}
		},
		onRootDrop: async (e) => {
			const item = e.items[0] as TextDropItem
			if (!item.types.has('resource-item')) return

			try {
				const resourceData = JSON.parse(await item.getText('resource-item'))
				const targetIndex = resources.length

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

	const handleResourceClick = async (resource: Resource) => {
		try {
			// まず現在のウィンドウの既存のタブを探す
			const response = await sendMessageToExtension({
				type: 'FIND_TAB',
				url: resource.url,
			})

			if (response?.tabId) {
				// タブが見つかった場合は、そのタブに切り替え
				const switchResponse = await sendMessageToExtension({
					type: 'SWITCH_TO_TAB',
					tabId: response.tabId,
				})

				if (switchResponse?.success) {
					return
				}
			}

			// タブが見つからない場合は新しいタブを開く
			window.open(resource.url, '_blank')
		} catch (error) {
			console.error('Failed to handle resource click:', error)
			// エラーの場合も新しいタブで開く
			window.open(resource.url, '_blank')
		}
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
					onAction={() => handleResourceClick(resource)}
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
