import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store/store'
import type { Section } from '@/app/features/section/types/section'

// メモ化されたセレクター
const selectSpaceState = (state: RootState) => state.space
const selectSectionState = (state: RootState) => state.section

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
		// メモ化されたソート処理
		return (
			spaceData?.sections
				?.slice()
				?.sort((a: Section, b: Section) => a.order - b.order) || []
		)
	},
	{
		// セレクターの等価性チェックをカスタマイズ
		memoizeOptions: {
			resultEqualityCheck: (a: Section[], b: Section[]) =>
				a.length === b.length &&
				a.every((section, i) => section.id === b[i].id),
		},
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
