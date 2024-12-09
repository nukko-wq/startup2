import { useMemo, useEffect } from 'react'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/app/store/store'
import { createSelector } from 'reselect'
import { fetchSectionsWithResources } from '@/app/features/section/sectionSlice'

// セレクターをコンポーネント外で定義
const createSectionResourceSelector = (sectionId: string) =>
	createSelector(
		[
			(state: RootState) => state.section.sectionsBySpace[sectionId],
			(state: RootState) =>
				state.resource.resourcesBySection[sectionId]?.resources,
			(state: RootState) =>
				state.resource.resourcesBySection[sectionId]?.loading,
			(state: RootState) => state.resource.resourcesBySection[sectionId]?.error,
		],
		(section, resources, resourceLoading, resourceError) => ({
			section,
			resources: resources || [],
			loading: section?.loading || resourceLoading,
			error: section?.error || resourceError,
		}),
	)

const CACHE_DURATION = 2 * 60 * 1000 // 2分に短縮

export const useSectionResources = (sectionId: string) => {
	const selectSectionResources = useMemo(
		() => createSectionResourceSelector(sectionId),
		[sectionId],
	)

	const result = useSelector(selectSectionResources, shallowEqual)
	const dispatch = useDispatch<AppDispatch>()

	useEffect(() => {
		// データがない場合は即時フェッチ
		if (!result.section) {
			dispatch(fetchSectionsWithResources(sectionId))
			return
		}

		const lastFetched = result.section?.lastFetched
		const hasValidCache =
			lastFetched && Date.now() - lastFetched <= CACHE_DURATION

		if (!hasValidCache) {
			dispatch(fetchSectionsWithResources(sectionId))
		}
	}, [sectionId, result.section, dispatch])

	return result
}
