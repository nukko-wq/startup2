'use client'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/app/store/store'
import SectionList from './SectionList'
import { Plus } from 'lucide-react'
import { Button } from 'react-aria-components'
import { createSection } from '@/app/features/section/sectionSlice'

const SectionListWrapper = () => {
	const dispatch = useDispatch<AppDispatch>()
	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)

	const handleCreateSection = async () => {
		if (!activeSpaceId) return
		try {
			await dispatch(createSection(activeSpaceId)).unwrap()
		} catch (error) {
			console.error('Failed to create section:', error)
		}
	}

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
}

export default SectionListWrapper
