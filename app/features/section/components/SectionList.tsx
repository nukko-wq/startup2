'use client'

import { memo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { store } from '@/app/store/store'
import {
	reorderSection,
	fetchSectionsWithResources,
} from '@/app/features/section/sectionSlice'
import {
	DropIndicator,
	GridList,
	GridListItem,
	useDragAndDrop,
} from 'react-aria-components'
import SectionItem from './SectionItem'
import {
	selectCurrentSections,
	selectSectionLoadingState,
} from '@/app/features/space/selectors'
import { shallowEqual } from 'react-redux'

interface SectionListProps {
	spaceId: string | null
}

const SectionList = memo(({ spaceId }: SectionListProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const sections = useSelector(selectCurrentSections, shallowEqual)
	const loadingState = useSelector(selectSectionLoadingState, shallowEqual)

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
						: targetSection.order

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
						`h-[2px] bg-blue-500/50 rounded transition-all ${
							isDropTarget ? 'bg-blue-500' : ''
						}`
					}
				/>
			)
		},
	})

	useEffect(() => {
		if (spaceId) {
			const CACHE_DURATION = 2 * 60 * 1000

			if (
				!loadingState.lastFetched ||
				Date.now() - loadingState.lastFetched > CACHE_DURATION
			) {
				dispatch(fetchSectionsWithResources(spaceId))
			}
		}
	}, [dispatch, spaceId, loadingState.lastFetched])

	if (loadingState.error) {
		console.error('Section error:', { spaceId, error: loadingState.error })
		return <div className="p-4 text-red-500">Error: {loadingState.error}</div>
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
})

SectionList.displayName = 'SectionList'

export default SectionList
