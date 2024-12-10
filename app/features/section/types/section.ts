import type { Resource } from '@prisma/client'

export interface Section {
	id: string
	name: string
	order: number
	spaceId: string
	resources?: Resource[]
}

export interface SectionState {
	sectionsBySpace: {
		[spaceId: string]: {
			sections: Section[]
			loading: boolean
			error: string | null
			lastFetched?: number | null
			cachedSortedSections?: Section[]
		}
	}
}

export interface CreateSectionPayload {
	spaceId: string
	optimisticId?: string
}

export interface DeleteSectionPayload {
	sectionId: string
	spaceId: string
}

export interface RenameSectionPayload {
	sectionId: string
	name: string
	spaceId: string
}

export interface ReorderSectionPayload {
	sectionId: string
	newOrder: number
	spaceId: string
}

export interface SectionApiResponse {
	sections: Section[]
}

export interface CreateSectionResponse {
	section: Section
	spaceId: string
}

export interface DeleteSectionResponse {
	deletedSection: Section
	updatedSections: Section[]
	spaceId: string
}

export interface RenameSectionResponse {
	section: Section
	spaceId: string
}

export interface ReorderSectionResponse {
	section: Section
	spaceId: string
	allSections: Section[]
}

export interface OptimisticSection extends Section {
	optimisticId?: string
}

export interface SectionsWithResourcesResponse {
	sections: Section[]
	resources: {
		[sectionId: string]: Resource[]
	}
}
