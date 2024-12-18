'use client'

import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { Button, Form, Input, Text } from 'react-aria-components'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import {
	renameSpace,
	renameSpaceOptimistically,
	fetchSpaces,
} from '@/app/features/space/spaceSlice'
import HeaderMenu from '@/app/components/header/HeaderMenu'

const Header = () => {
	const dispatch = useDispatch<AppDispatch>()
	const [isEditing, setIsEditing] = useState(false)
	const [editingName, setEditingName] = useState('')

	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)
	const activeSpace = useSelector((state: RootState) => {
		if (!activeSpaceId) return null
		for (const workspace of Object.values(state.space.spacesByWorkspace)) {
			const space = workspace.spaces.find((s) => s.id === activeSpaceId)
			if (space) return space
		}
		return null
	})

	const handleEditStart = () => {
		if (activeSpace) {
			setEditingName(activeSpace.name)
			setIsEditing(true)
		}
	}

	const handleEditSubmit = async () => {
		if (!activeSpace || !editingName.trim()) return

		try {
			// 楽観的更新を適用
			dispatch(
				renameSpaceOptimistically({
					workspaceId: activeSpace.workspaceId,
					spaceId: activeSpace.id,
					name: editingName.trim(),
				}),
			)

			setIsEditing(false)
			// APIリクエストを実行
			await dispatch(
				renameSpace({
					spaceId: activeSpace.id,
					name: editingName.trim(),
					workspaceId: activeSpace.workspaceId,
				}),
			).unwrap()
		} catch (error) {
			console.error('スペース名の変更に失敗しました:', error)
			// エラー時は状態を同期
			dispatch(fetchSpaces(activeSpace.workspaceId))
		}
	}

	const handleEditCancel = () => {
		setIsEditing(false)
		if (activeSpace) {
			setEditingName(activeSpace.name)
		}
	}

	return (
		<div className="flex items-center justify-between p-4 w-full">
			<div className="flex items-center gap-2">
				{isEditing ? (
					<Form
						className="flex items-center"
						onSubmit={(e) => {
							e.preventDefault()
							handleEditSubmit()
						}}
					>
						<Input
							autoFocus
							value={editingName}
							onChange={(e) => setEditingName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Escape') {
									handleEditCancel()
								}
							}}
							onBlur={handleEditCancel}
							className="text-xl font-bold py-1 pl-6 text-zinc-800 bg-transparent border-b-2 border-blue-500 outline-none"
							onFocus={(e) => {
								const input = e.target as HTMLInputElement
								const length = input.value.length
								input.setSelectionRange(length, length)
							}}
						/>
					</Form>
				) : (
					<Button
						className="group flex items-center gap-2 hover:bg-zinc-100 rounded-lg px-2 py-1 outline-none"
						onPress={handleEditStart}
						aria-label="Space Name"
					>
						<Text className="text-xl font-bold text-zinc-800 pl-4">
							{activeSpace?.name || 'Select a Space'}
						</Text>
						<Pencil className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
					</Button>
				)}
			</div>
			<HeaderMenu />
		</div>
	)
}

export default Header
