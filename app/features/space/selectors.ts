import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store/store'

export const selectActiveSpace = createSelector(
	[
		(state: RootState) => state.space.activeSpaceId,
		(state: RootState) => state.space.spacesByWorkspace,
	],
	(activeSpaceId, spacesByWorkspace) => {
		if (!activeSpaceId) return null
		for (const workspace of Object.values(spacesByWorkspace)) {
			const space = workspace.spaces.find((s) => s.id === activeSpaceId)
			if (space) return space
		}
		return null
	},
)

export const selectCurrentSections = createSelector(
	[
		(state: RootState) => state.space.activeSpaceId,
		(state: RootState) => state.section.sectionsBySpace,
	],
	(activeSpaceId, sectionsBySpace) => {
		if (!activeSpaceId) return []
		return sectionsBySpace[activeSpaceId]?.sections || []
	},
)
