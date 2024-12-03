import type { FetchGoogleDriveFilesResponse } from '@/app/features/google-drive/types/googleDrive'

export const googleDriveApi = {
	fetchFiles: async (
		query?: string,
	): Promise<FetchGoogleDriveFilesResponse> => {
		const url = query
			? `/api/googleapis?q=${encodeURIComponent(query)}`
			: '/api/googleapis'

		const response = await fetch(url)
		if (!response.ok) {
			throw new Error('Google Driveファイルの取得に失敗しました')
		}

		return response.json()
	},
}
