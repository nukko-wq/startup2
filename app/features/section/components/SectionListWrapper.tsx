'use client'
import { memo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/app/store/store'
import SectionList from '@/app/features/section/components/SectionList'
import { Plus } from 'lucide-react'
import { Button } from 'react-aria-components'
import {
	addSectionOptimistically,
	createSection,
	removeSectionOptimistically,
} from '@/app/features/section/sectionSlice'
import type { OptimisticSection } from '@/app/features/section/types/section'
import { v4 as uuidv4 } from 'uuid'
import { selectCurrentSections } from '@/app/features/space/selectors'

const selectActiveSpaceId = (state: RootState) => state.space.activeSpaceId

const SectionListWrapper = memo(() => {
	const dispatch = useDispatch<AppDispatch>()
	const activeSpaceId = useSelector(selectActiveSpaceId)
	const existingSections = useSelector(selectCurrentSections)

	const handleCreateSection = useCallback(async () => {
		if (!activeSpaceId) return

		const optimisticId = uuidv4()

		try {
			const optimisticSection: OptimisticSection = {
				id: optimisticId,
				name: 'Resources',
				order: existingSections.length,
				spaceId: activeSpaceId,
			}

			dispatch(
				addSectionOptimistically({
					spaceId: activeSpaceId,
					section: optimisticSection,
				}),
			)

			await dispatch(
				createSection({
					spaceId: activeSpaceId,
					optimisticId,
				}),
			).unwrap()
		} catch (error) {
			console.error('Failed to create section:', error)
			dispatch(
				removeSectionOptimistically({
					spaceId: activeSpaceId,
					sectionId: optimisticId,
				}),
			)
		}
	}, [activeSpaceId, dispatch, existingSections.length])

	if (!activeSpaceId) {
		return <div>No active space</div>
	}

	return (
		<div className="flex flex-col flex-grow w-full max-w-[920px]">
			<div className="flex flex-col w-full">
				<SectionList spaceId={activeSpaceId} />
			</div>
			<div className="flex justify-center mt-4">
				<Button
					onPress={handleCreateSection}
					className="flex items-center gap-1 px-4 py-2 outline-none text-gray-500 hover:text-gray-700 transition-colors"
				>
					<Plus className="w-3 h-3" />
					<span>RESOURCE SECTION</span>
				</Button>
			</div>
		</div>
	)
})

SectionListWrapper.displayName = 'SectionListWrapper'

export default SectionListWrapper
