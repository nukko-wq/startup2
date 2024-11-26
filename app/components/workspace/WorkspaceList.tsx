'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import {
	fetchWorkspaces,
	setActiveWorkspace,
} from '@/app/features/workspace/workspaceSlice'
import { useSession } from 'next-auth/react'
import WorkspaceLeftMenu from '@/app/components/workspace/WorkspaceLeftMenu'
import WorkspaceRightMenu from '@/app/components/workspace/WorkspaceRightMenu'
import { ChevronRight, Layers } from 'lucide-react'
import DefaultWorkSpaceRightMenu from '@/app/components/workspace/DefaultWorkSpaceRightMenu'
import { Button } from 'react-aria-components'
import SpaceList from '@/app/components/space/SpaceList'

const WorkspaceList = () => {
	const dispatch = useDispatch<AppDispatch>()
	const { status } = useSession()
	const { workspaces, loading, error, activeWorkspaceId } = useSelector(
		(state: RootState) => state.workspace,
	)

	useEffect(() => {
		if (status === 'authenticated') {
			dispatch(fetchWorkspaces())
		}
	}, [dispatch, status])

	useEffect(() => {
		if (workspaces.length > 0 && !activeWorkspaceId) {
			dispatch(setActiveWorkspace(workspaces[0].id))
		}
	}, [workspaces, activeWorkspaceId, dispatch])

	if (status === 'loading' || loading)
		return <div className="text-zinc-50">読み込み中...</div>
	if (status === 'unauthenticated')
		return <div className="text-zinc-50">ログインしてください</div>
	if (error) return <div className="text-zinc-50">エラーが発生しました</div>

	return (
		<div className="space-y-1">
			{/*デフォルトワークスペースを表示 */}
			<div className="mb-4">
				<div className="flex items-center">
					<div className="flex flex-col flex-grow justify-between">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<div className="rounded-full py-1 pl-1 pr-2 ml-2">
									<Layers className="w-6 h-6 text-gray-500" />
								</div>
								<span className="font-medium text-gray-500">Spaces</span>
							</div>
							<div className="mt-2 space-y-1">
								<DefaultWorkSpaceRightMenu />
							</div>
						</div>
					</div>
				</div>
			</div>
			{workspaces.map((workspace) => (
				<div key={workspace.id} className="">
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
					<div
						className="flex items-center justify-between group"
						onClick={() => dispatch(setActiveWorkspace(workspace.id))}
					>
						<div
							className={`flex items-center flex-grow mt-6 ${
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
									<WorkspaceLeftMenu />
									<WorkspaceRightMenu workspaceId={workspace.id} />
								</div>
							</div>
						</div>
					</div>
					<SpaceList workspaceId={workspace.id} />
				</div>
			))}
		</div>
	)
}

export default WorkspaceList
