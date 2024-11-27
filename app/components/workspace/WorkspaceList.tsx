'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import {
	fetchWorkspaces,
	setActiveWorkspace,
	createDefaultWorkspace,
} from '@/app/features/workspace/workspaceSlice'
import { useSession } from 'next-auth/react'
import WorkspaceLeftMenu from '@/app/components/workspace/WorkspaceLeftMenu'
import WorkspaceRightMenu from '@/app/components/workspace/WorkspaceRightMenu'
import { ChevronRight, Layers } from 'lucide-react'
import DefaultWorkSpaceRightMenu from '@/app/components/workspace/DefaultWorkspaceRightMenu'
import { Button, GridList, GridListItem } from 'react-aria-components'
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

	/*
	if (status === 'loading' || loading)
		return <div className="text-zinc-50">読み込み中...</div>
	*/
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
			<GridList items={workspaces} className="space-y-1">
				{(workspace) => (
					<GridListItem key={workspace.id} className="outline-none">
						<div className="flex items-center">
							<div className="flex flex-col flex-grow justify-between">
								<div className="flex items-center justify-between group">
									<div
										className={`flex items-center flex-grow ${
											activeWorkspaceId === workspace.id ? 'bg-gray-100' : ''
										}`}
									>
										<div className="flex items-center cursor-grab">
											<Button className="rounded-full py-1 pl-1 pr-2 ml-2">
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
