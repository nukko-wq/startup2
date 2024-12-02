import type { Resource } from '@prisma/client'

export interface ResourceState {
	resourcesBySection: {
		[sectionId: string]: {
			resources: Resource[]
			loading: boolean
			error: string | null
		}
	}
}

export interface CreateResourcePayload {
	title: string
	url: string
	sectionId: string
	faviconUrl?: string
	mimeType?: string
	description?: string
	isGoogleDrive?: boolean
}

export interface UpdateResourcePayload {
	id: string
	title: string
	url: string
	description?: string
}

export interface ReorderResourcePayload {
	resourceId: string
	sectionId: string
	newOrder: number
	allOrders: { resourceId: string; newOrder: number }[]
}

export interface MoveResourcePayload {
	resourceId: string
	targetSectionId: string
	newOrder: number
}

export interface CreateResourceResponse extends Resource {}

export interface UpdateResourceResponse extends Resource {}

export interface DeleteResourceResponse {
	id: string
	sectionId: string
}

export interface ReorderResourceResponse {
	sectionId: string
	updatedResources: Resource[]
}

export interface MoveResourceResponse {
	movedResource: Resource
	sourceSectionId: string
	targetSectionId: string
}
