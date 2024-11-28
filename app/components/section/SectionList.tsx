'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import {
	fetchSections,
	reorderSection,
} from '@/app/features/section/sectionSlice'
import {
	DropIndicator,
	GridList,
	GridListItem,
	useDragAndDrop,
} from 'react-aria-components'
import SectionItem from './SectionItem'

interface SectionListProps {
	spaceId: string | null
}

const SectionList = ({ spaceId }: SectionListProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const { sections, loading, error } = useSelector(
		(state: RootState) =>
			state.section.sectionsBySpace[spaceId || ''] || {
				sections: [],
				loading: false,
				error: null,
			},
	)

	const { dragAndDropHooks } = useDragAndDrop({
		getItems: (keys) => {
			return [...keys].map((key) => ({
				'section-id': String(key),
				'text/plain': sections.find((s) => s.id === key)?.name || '',
			}))
		},
		acceptedDragTypes: ['section-id'],
		async onReorder(e) {
			if (!spaceId) return

			try {
				const draggedId = Array.from(e.keys)[0] as string
				const targetId = e.target.key as string

				const draggedSection = sections.find((s) => s.id === draggedId)
				const targetSection = sections.find((s) => s.id === targetId)

				if (!draggedSection || !targetSection) return

				const newOrder =
					e.target.dropPosition === 'before'
						? targetSection.order
						: targetSection.order + 1

				await dispatch(
					reorderSection({
						sectionId: draggedId,
						newOrder,
						spaceId,
					}),
				).unwrap()
			} catch (error) {
				console.error('Error reordering sections:', error)
			}
		},
		renderDropIndicator(target) {
			return (
				<DropIndicator
					target={target}
					className={({ isDropTarget }) =>
						`h-1 bg-blue-500/50 rounded transition-all ${isDropTarget ? 'bg-blue-500' : ''}`
					}
				/>
			)
		},
	})

	useEffect(() => {
		if (spaceId) {
			dispatch(fetchSections(spaceId))
		}
	}, [dispatch, spaceId])

	if (!spaceId) {
		return <div>スペースが選択されていません</div>
	}

	if (loading) {
		return <div>読み込み中...</div>
	}

	if (error) {
		return <div>エラー: {error}</div>
	}

	return (
		<GridList
			aria-label="Sections"
			items={sections}
			dragAndDropHooks={dragAndDropHooks}
			className="flex flex-col w-full gap-2"
		>
			{(section) => (
				<GridListItem key={section.id} className="outline-none group">
					<SectionItem section={section} />
				</GridListItem>
			)}
		</GridList>
	)
}

export default SectionList
