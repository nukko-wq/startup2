'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import {
	fetchWorkspaces,
	setActiveWorkspace,
	createDefaultWorkspace,
	reorderWorkspace,
} from '@/app/features/workspace/workspaceSlice'
import { useSession } from 'next-auth/react'
import WorkspaceLeftMenu from '@/app/components/workspace/WorkspaceLeftMenu'
import WorkspaceRightMenu from '@/app/components/workspace/WorkspaceRightMenu'
import { ChevronRight, Layers } from 'lucide-react'
import DefaultWorkSpaceRightMenu from '@/app/components/workspace/DefaultWorkspaceRightMenu'
import {
	Button,
	GridList,
	GridListItem,
	useDragAndDrop,
} from 'react-aria-components'
import SpaceList from '@/app/components/space/SpaceList'

const WorkspaceList = () => {
	const dispatch = useDispatch<AppDispatch>()
	const { status } = useSession()
	const { workspaces, defaultWorkspace, loading, error, activeWorkspaceId } =
		useSelector((state: RootState) => state.workspace)

	useEffect(() => {
		if (status === 'authenticated') {
			dispatch(fetchWorkspaces())
		}
	}, [dispatch, status])

	useEffect(() => {
		if (status === 'authenticated' && !loading && !defaultWorkspace) {
			dispatch(createDefaultWorkspace())
		}
	}, [dispatch, status, loading, defaultWorkspace])

	useEffect(() => {
		if (workspaces.length > 0 && !activeWorkspaceId) {
			dispatch(setActiveWorkspace(workspaces[0].id))
		}
	}, [workspaces, activeWorkspaceId, dispatch])

	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) => {
			const workspace = workspaces.find((w) => keys.has(w.id))
			if (workspace?.isDefault) return []

			return [
				{
					'workspace-id': String(workspace?.id),
					'text/plain': workspace?.name || '',
				},
			]
		},
		acceptedDragTypes: ['workspace-id'],
		getDropOperation: (target) => {
			if (target?.type === 'item') {
				const workspace = workspaces.find((w) => w.id === target.key)
				return workspace?.isDefault ? 'cancel' : 'move'
			}
			return 'move'
		},
		renderDropIndicator(target) {
			return (
				<div
					className={`drop-indicator ${
						target?.type === 'item' ? 'active' : ''
					}`}
				/>
			)
		},
		async onReorder(e) {
			try {
				const draggedId = Array.from(e.keys)[0] as string
				const targetId = e.target.key as string

				const draggedWorkspace = workspaces.find((w) => w.id === draggedId)
				const targetWorkspace = workspaces.find((w) => w.id === targetId)

				if (draggedWorkspace?.isDefault || targetWorkspace?.isDefault) return

				const reorderableWorkspaces = workspaces.filter((w) => !w.isDefault)
				const draggedIndex = reorderableWorkspaces.findIndex(
					(w) => w.id === draggedId,
				)
				const targetIndex = reorderableWorkspaces.findIndex(
					(w) => w.id === targetId,
				)

				if (draggedIndex === -1 || targetIndex === -1) return

				const newOrder =
					e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1

				await dispatch(
					reorderWorkspace({
						workspaceId: draggedId,
						newOrder,
					}),
				).unwrap()
			} catch (error) {
				console.error('Error reordering workspaces:', error)
			}
		},
	})

	if (status === 'unauthenticated')
		return <div className="text-zinc-50">ログインしてください</div>
	if (error) return <div className="text-zinc-50">エラーが発生しました</div>

	return (
		<div className="space-y-1">
			{/* デフォルトワークスペース */}
			{defaultWorkspace && (
				<div className="mb-4">
					<div className="flex items-center">
						<div className="flex flex-col flex-grow justify-between">
							<div className="flex items-center justify-between mb-1">
								<div className="flex items-center">
									<div className="rounded-full py-1 pl-1 pr-2 ml-2">
										<Layers className="w-6 h-6 text-gray-500" />
									</div>
									<span className="font-medium text-gray-500">Spaces</span>
								</div>
								<div className="">
									<DefaultWorkSpaceRightMenu />
								</div>
							</div>
						</div>
					</div>
					<SpaceList workspaceId={defaultWorkspace.id} />
				</div>
			)}
			{/* 通常のワークスペース */}
			<GridList
				aria-label="Workspaces"
				items={workspaces.filter((w) => !w.isDefault)}
				dragAndDropHooks={dragAndDropHooks}
				className="flex flex-col outline-none"
			>
				{(workspace) => (
					<GridListItem key={workspace.id} className="outline-none">
						<div className="flex items-center">
							<div className="flex flex-col flex-grow justify-between">
								<div className="flex items-center justify-between group">
									<div className="flex items-center flex-grow">
										<div className="flex items-center cursor-grab">
											<Button
												slot="drag"
												className="rounded-full py-1 pl-1 pr-2 ml-2"
											>
												<ChevronRight className="w-6 h-6 text-gray-500" />
											</Button>
										</div>
										<div className="flex items-center flex-grow justify-between hover:border-b-2 hover:border-blue-500 pb-1">
											<span className="font-medium text-gray-500">
												{workspace.name}
											</span>
											<div className="flex items-center">
												<WorkspaceLeftMenu workspaceId={workspace.id} />
												<WorkspaceRightMenu workspaceId={workspace.id} />
											</div>
										</div>
									</div>
								</div>
								<SpaceList workspaceId={workspace.id} />
							</div>
						</div>
					</GridListItem>
				)}
			</GridList>
		</div>
	)
}

export default WorkspaceList
