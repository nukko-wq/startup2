import { useMemo } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import type { RootState } from '@/app/store/store'
import { createSelector } from 'reselect'

export const useSectionResources = (sectionId: string) => {
	const selectSectionResources = useMemo(
		() =>
			createSelector(
				[
					(state: RootState) => state.section.sectionsBySpace[sectionId],
					(state: RootState) => state.resource.resourcesBySection[sectionId],
				],
				(section, resources) => ({
					section,
					resources: resources?.resources || [],
					loading: section?.loading || resources?.loading,
					error: section?.error || resources?.error,
				}),
			),
		[sectionId],
	)

	return useSelector(selectSectionResources)
}
