import { useMemo } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import type { RootState } from '@/app/store/store'

export const useSectionResources = (sectionId: string) => {
	const selectSectionResources = useMemo(
		() => (state: RootState) => ({
			section: state.section.sectionsBySpace[sectionId],
			resources: state.resource.resourcesBySection[sectionId]?.resources || [],
			loading:
				state.section.sectionsBySpace[sectionId]?.loading ||
				state.resource.resourcesBySection[sectionId]?.loading,
			error:
				state.section.sectionsBySpace[sectionId]?.error ||
				state.resource.resourcesBySection[sectionId]?.error,
		}),
		[sectionId],
	)

	return useSelector(selectSectionResources, shallowEqual)
}
