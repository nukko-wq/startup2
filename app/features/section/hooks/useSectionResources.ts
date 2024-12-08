import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'

export const useSectionResources = (sectionId: string) => {
	return useMemo(() => {
		return useSelector((state: RootState) => {
			const section = state.section.sectionsBySpace[sectionId]
			const resources = state.resource.resourcesBySection[sectionId]
			return {
				section,
				resources: resources?.resources || [],
				loading: section?.loading || resources?.loading,
				error: section?.error || resources?.error,
			}
		})
	}, [sectionId])
}
