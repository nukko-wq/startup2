import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store/store'

const selectSpaceState = (state: RootState) => state.space
const selectSectionState = (state: RootState) => state.section
const selectActiveSpaceId = (state: RootState) => state.space.activeSpaceId

export const selectActiveSpace = createSelector(
	[selectSpaceState, selectActiveSpaceId],
	(spaceState, activeSpaceId) => {
		if (!activeSpaceId) return null
		for (const workspace of Object.values(spaceState.spacesByWorkspace)) {
			const space = workspace.spaces.find((s) => s.id === activeSpaceId)
			if (space) return space
		}
		return null
	},
)

const selectActiveSectionState = createSelector(
	[selectSectionState, selectActiveSpaceId],
	(sectionState, activeSpaceId) =>
		activeSpaceId ? sectionState.sectionsBySpace[activeSpaceId] : null,
)

export const selectCurrentSections = createSelector(
	[selectActiveSectionState],
	(sectionState) => sectionState?.sections || [],
)

export const selectSectionsLoading = createSelector(
	[selectActiveSectionState],
	(sectionState) => sectionState?.loading || false,
)
