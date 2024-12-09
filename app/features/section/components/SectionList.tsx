'use client'

import { useEffect } from 'react'
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

interface SectionListProps {
	spaceId: string | null
}

const SectionList = ({ spaceId }: SectionListProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const sectionState = useSelector(
		(state: RootState) => state.section.sectionsBySpace[spaceId || ''],
	)

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
						`h-[2px] bg-blue-500/50 rounded transition-all ${isDropTarget ? 'bg-blue-500' : ''}`
					}
				/>
			)
		},
	})

	useEffect(() => {
		if (spaceId) {
			const lastFetched = sectionState?.lastFetched
			const CACHE_DURATION = 5 * 60 * 1000

			console.log('SectionList fetch check:', {
				spaceId,
				lastFetched,
				sections: sectionState?.sections,
				shouldFetch:
					!sectionState?.sections ||
					Date.now() - (lastFetched || 0) > CACHE_DURATION,
			})

			if (
				!sectionState?.sections ||
				Date.now() - (lastFetched || 0) > CACHE_DURATION
			) {
				console.log('Dispatching fetchSectionsWithResources for:', spaceId)
				dispatch(fetchSectionsWithResources(spaceId))
					.unwrap()
					.then((result) => {
						console.log('Fetch result:', result)
					})
					.catch((error) => {
						// ConditionErrorの場合は無視（正常な動作）
						if (error.name !== 'ConditionError') {
							console.error('Fetch error:', error)
						}
					})
			}
		}
	}, [dispatch, spaceId, sectionState])

	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			console.log('SectionList state update:', {
				spaceId,
				sectionState: {
					sections: sectionState?.sections || [],
					loading: sectionState?.loading || false,
					error: sectionState?.error || null,
					lastFetched: sectionState?.lastFetched,
				},
				reduxState: store.getState().section.sectionsBySpace[spaceId || ''],
			})
		}
	}, [spaceId, sectionState])

	if (!spaceId) {
		return <div>スペースが選択されていません</div>
	}

	// if (loading) {
	// 	console.log('Loading state:', { spaceId, loading })
	// 	return <div className="p-4">Loading sections...</div>
	// }

	if (error) {
		console.error('Section error:', { spaceId, error })
		return <div className="p-4 text-red-500">Error: {error}</div>
	}

	// if (!sections || sections.length === 0) {
	// 	console.log('No sections:', { spaceId, sections })
	// 	return <div className="p-4">No sections available</div>
	// }

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
