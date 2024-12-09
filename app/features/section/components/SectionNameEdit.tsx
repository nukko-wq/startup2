'use client'

import { Pencil } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	renameSection,
	renameSectionOptimistically,
	fetchSections,
} from '@/app/features/section/sectionSlice'
import type { AppDispatch, RootState } from '@/app/store/store'
import type { Section } from '@/app/features/section/types/section'
import { Button, Form, Input, Text } from 'react-aria-components'

interface SectionNameEditProps {
	section: Section
}

const SectionNameEdit = ({ section }: SectionNameEditProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isEditing, setIsEditing] = useState(false)
	const [editingName, setEditingName] = useState(section.name)
	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)

	const handleEditStart = () => {
		setEditingName(section.name)
		setIsEditing(true)
	}

	const handleEditSubmit = async () => {
		if (!activeSpaceId || !editingName.trim()) return

		try {
			dispatch(
				renameSectionOptimistically({
					spaceId: activeSpaceId,
					sectionId: section.id,
					name: editingName.trim(),
				}),
			)
			setIsEditing(false)

			await dispatch(
				renameSection({
					sectionId: section.id,
					name: editingName.trim(),
					spaceId: activeSpaceId,
				}),
			).unwrap()
		} catch (error) {
			console.error('セクション名の変更に失敗しました:', error)
			dispatch(fetchSections(activeSpaceId))
		}
	}

	const handleEditCancel = () => {
		setIsEditing(false)
		setEditingName(section.name)
	}

	return (
		<div className="flex items-center">
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
						className="text-[17px] py-1 px-3 text-zinc-800 bg-transparent border-b-2 border-blue-500 outline-none"
						onFocus={(e) => {
							const input = e.target as HTMLInputElement
							const length = input.value.length
							input.setSelectionRange(length, length)
						}}
					/>
				</Form>
			) : (
				<Button
					className="group/section-name section-name flex items-center gap-2 hover:bg-zinc-100 rounded px-3 py-2 outline-none"
					onPress={handleEditStart}
					aria-label="Section Name"
				>
					<Text className="text-[17px] text-zinc-800">{section.name}</Text>
					<Pencil className="w-4 h-4 text-zinc-400 opacity-0 group-hover/section-name:opacity-100 transition-opacity" />
				</Button>
			)}
		</div>
	)
}

export default SectionNameEdit
