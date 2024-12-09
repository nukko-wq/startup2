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
			(state: RootState) => state.resource.resourcesBySection[sectionId],
		],
		(section, resources) => ({
			section,
			resources: resources?.resources || [],
			loading: section?.loading || resources?.loading,
			error: section?.error || resources?.error,
		}),
	)

const CACHE_DURATION = 5 * 60 * 1000 // 5分

export const useSectionResources = (sectionId: string) => {
	const selectSectionResources = useMemo(
		() => createSectionResourceSelector(sectionId),
		[sectionId],
	)

	const result = useSelector(selectSectionResources, shallowEqual)
	const dispatch = useDispatch<AppDispatch>()

	useEffect(() => {
		const lastFetched = result.section?.lastFetched
		const hasValidCache =
			lastFetched && Date.now() - lastFetched <= CACHE_DURATION
		const hasData = result.section && result.resources.length > 0

		// キャッシュが有効か、データが既に存在する場合はスキップ
		if (hasValidCache || hasData) {
			return
		}

		dispatch(fetchSectionsWithResources(sectionId))
	}, [sectionId, result.section, result.resources.length, dispatch])

	return result
}
