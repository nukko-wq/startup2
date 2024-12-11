import type {
	Section,
	SectionApiResponse,
	CreateSectionResponse,
	DeleteSectionResponse,
	RenameSectionResponse,
	ReorderSectionResponse,
	SectionsWithResourcesResponse,
} from '@/app/features/section/types/section'

export const sectionApi = {
	fetchSections: async (spaceId: string): Promise<Section[]> => {
		const response = await fetch(`/api/spaces/${spaceId}/sections`)
		if (!response.ok) {
			throw new Error('セクションの取得に失敗しました')
		}
		return response.json()
	},

	createSection: async (spaceId: string): Promise<CreateSectionResponse> => {
		const response = await fetch(`/api/spaces/${spaceId}/sections`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: 'Resources',
			}),
		})

		if (!response.ok) {
			throw new Error('セクションの作成に失敗しました')
		}

		const section = await response.json()
		return { section, spaceId }
	},

	deleteSection: async (
		sectionId: string,
		spaceId: string,
	): Promise<DeleteSectionResponse> => {
		const response = await fetch(`/api/sections/${sectionId}`, {
			method: 'DELETE',
		})

		if (!response.ok) {
			throw new Error('セクションの削除に失敗しました')
		}

		return response.json()
	},

	renameSection: async (
		sectionId: string,
		name: string,
		spaceId: string,
	): Promise<RenameSectionResponse> => {
		const response = await fetch(`/api/sections/${sectionId}`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name }),
		})

		if (!response.ok) {
			throw new Error('セクション名の変更に失敗しました')
		}

		const section = await response.json()
		return { section, spaceId }
	},

	reorderSection: async (
		sectionId: string,
		newOrder: number,
		spaceId: string,
	): Promise<ReorderSectionResponse> => {
		const response = await fetch(`/api/sections/${sectionId}/reorder`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ order: newOrder }),
		})

		if (!response.ok) {
			throw new Error('セクションの並び替えに失敗しました')
		}

		const responseData = await response.json()
		return {
			section: responseData.updatedSection,
			spaceId,
			allSections: responseData.allSections,
		}
	},

	fetchSectionsWithResources: async (
		spaceId: string,
	): Promise<SectionsWithResourcesResponse> => {
		console.log('API call started for spaceId:', spaceId)
		try {
			const response = await fetch(
				`/api/spaces/${spaceId}/sections/with-resources`,
				{
					headers: {
						'Cache-Control': 'max-age=60, stale-while-revalidate=300',
						Accept: 'application/json',
						Priority: 'high',
					},
				},
			)

			console.log('API response status:', response.status)

			if (!response.ok) {
				const errorText = await response.text()
				console.error('API error response:', {
					status: response.status,
					statusText: response.statusText,
					error: errorText,
					spaceId,
				})
				throw new Error(`Failed to fetch sections: ${errorText}`)
			}

			const data = await response.json()
			console.log('API success response for spaceId:', spaceId, data)

			if (!data.sections) {
				console.warn('No sections in response for spaceId:', spaceId)
			}

			return data
		} catch (error) {
			console.error('API call failed for spaceId:', spaceId, error)
			throw error
		}
	},
}
