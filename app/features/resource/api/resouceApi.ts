import type {
	CreateResourcePayload,
	UpdateResourcePayload,
	ReorderResourcePayload,
	MoveResourcePayload,
	CreateResourceResponse,
	UpdateResourceResponse,
	DeleteResourceResponse,
	ReorderResourceResponse,
	MoveResourceResponse,
} from '@/app/features/resource/types/resouce'
import type { Resource } from '@prisma/client'

export const resourceApi = {
	fetchResources: async (sectionId: string): Promise<Resource[]> => {
		const response = await fetch(`/api/sections/${sectionId}/resources`)
		if (!response.ok) {
			throw new Error('リソースの取得に失敗しました')
		}
		return response.json()
	},

	createResource: async ({
		title,
		url,
		sectionId,
		faviconUrl,
		mimeType,
		description,
		isGoogleDrive,
	}: CreateResourcePayload): Promise<CreateResourceResponse> => {
		const response = await fetch('/api/resources', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
				url,
				sectionId,
				faviconUrl,
				mimeType,
				description,
				isGoogleDrive,
			}),
		})

		if (!response.ok) {
			throw new Error('リソースの作成に失敗しました')
		}

		return response.json()
	},

	deleteResource: async (
		resourceId: string,
	): Promise<DeleteResourceResponse> => {
		const response = await fetch(`/api/resources/${resourceId}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			throw new Error('リソースの削除に失敗しました')
		}

		return response.json()
	},

	updateResource: async ({
		id,
		title,
		url,
		description,
	}: UpdateResourcePayload): Promise<UpdateResourceResponse> => {
		const response = await fetch(`/api/resources/${id}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
				url,
				description,
			}),
		})

		if (!response.ok) {
			throw new Error('リソースの更新に失敗しました')
		}

		return response.json()
	},

	reorderResource: async ({
		resourceId,
		sectionId,
		newOrder,
		allOrders,
	}: ReorderResourcePayload): Promise<ReorderResourceResponse> => {
		const response = await fetch(`/api/resources/${resourceId}/reorder`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				sectionId,
				order: newOrder,
				allOrders,
			}),
		})

		if (!response.ok) {
			throw new Error('リソースの並び替えに失敗しました')
		}

		return response.json()
	},

	moveResource: async ({
		resourceId,
		targetSectionId,
		newOrder,
	}: MoveResourcePayload): Promise<MoveResourceResponse> => {
		const response = await fetch(`/api/resources/${resourceId}/move`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				sectionId: targetSectionId,
				order: newOrder,
			}),
		})

		if (!response.ok) {
			throw new Error('リソースの移動に失敗しました')
		}

		return response.json()
	},
}
