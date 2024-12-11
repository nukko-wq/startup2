import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store/store'
import type { Section } from '@/app/features/section/types/section'

// メモ化されたセレクター
const selectSpaceState = (state: RootState) => state.space
const selectSectionState = (state: RootState) => state.section

// メモ化されたソート関数
const sortSections = (sections: Section[]) =>
	[...sections].sort((a, b) => a.order - b.order)

export const selectActiveSpace = createSelector(
	[selectSpaceState, (state: RootState) => state.space.activeSpaceId],
	(spaceState, activeSpaceId) => {
		if (!activeSpaceId) return null
		for (const workspace of Object.values(spaceState.spacesByWorkspace)) {
			const space = workspace.spaces.find((s) => s.id === activeSpaceId)
			if (space) return space
		}
		return null
	},
)

export const selectCurrentSections = createSelector(
	[
		selectSectionState,
		(state: RootState) => state.space.activeSpaceId,
		(state: RootState) => state.section.sectionsBySpace,
	],
	(sectionState, activeSpaceId, sectionsBySpace) => {
		if (!activeSpaceId) return []
		const spaceData = sectionsBySpace[activeSpaceId]
		if (!spaceData?.sections) return []

		// セクションを直接ソートして返す
		return sortSections(spaceData.sections)
	},
)

export const selectSectionLoadingState = createSelector(
	[
		(state: RootState) => state.space.activeSpaceId,
		(state: RootState) => state.section.sectionsBySpace,
	],
	(activeSpaceId, sectionsBySpace) => {
		if (!activeSpaceId) return { loading: false, error: null }
		const spaceData = sectionsBySpace[activeSpaceId]
		return {
			loading: spaceData?.loading || false,
			error: spaceData?.error || null,
			lastFetched: spaceData?.lastFetched,
		}
	},
)

export const selectActiveSpaceWithSections = createSelector(
	[
		selectSpaceState,
		selectSectionState,
		(state: RootState) => state.space.activeSpaceId,
	],
	(spaceState, sectionState, activeSpaceId) => {
		if (!activeSpaceId) return null

		// スペースの検索を最適化
		const activeSpace = Object.values(spaceState.spacesByWorkspace)
			.flatMap((ws) => ws.spaces)
			.find((s) => s.id === activeSpaceId)

		const sections = sectionState.sectionsBySpace[activeSpaceId]?.sections || []

		return {
			space: activeSpace,
			sections: sections.slice().sort((a, b) => a.order - b.order),
		}
	},
	{
		// リセレクト防止のための等価性チェックを追加
		memoizeOptions: {
			resultEqualityCheck: (a, b) =>
				a?.space?.id === b?.space?.id &&
				a?.sections?.length === b?.sections?.length,
		},
	},
)
