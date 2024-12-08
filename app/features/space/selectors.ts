import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store/store'

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
	[selectSectionState, (state: RootState) => state.space.activeSpaceId],
	(sectionState, activeSpaceId) => {
		if (!activeSpaceId) return []
		return sectionState.sectionsBySpace[activeSpaceId]?.sections || []
	},
)
