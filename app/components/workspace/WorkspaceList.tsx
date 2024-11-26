'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchWorkspaces } from '@/app/features/workspace/workspaceSlice'
import { useSession } from 'next-auth/react'

const WorkspaceList = () => {
	const dispatch = useDispatch<AppDispatch>()
	const { status } = useSession()
	const { workspaces, loading, error } = useSelector(
		(state: RootState) => state.workspace,
	)

	useEffect(() => {
		if (status === 'authenticated') {
			dispatch(fetchWorkspaces())
		}
	}, [dispatch, status])

	if (status === 'loading' || loading)
		return <div className="text-zinc-50">読み込み中...</div>
	if (status === 'unauthenticated')
		return <div className="text-zinc-50">ログインしてください</div>
	if (error) return <div className="text-zinc-50">エラーが発生しました</div>

	return (
		<div className="p-4">
			{workspaces.map((workspace) => (
				<div
					key={workspace.id}
					className="p-2 mb-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 text-zinc-50"
				>
					{workspace.name}
				</div>
			))}
		</div>
	)
}

export default WorkspaceList
