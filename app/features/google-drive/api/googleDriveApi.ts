import type {
	FetchGoogleDriveFilesResponse,
	GoogleDriveApiError,
} from '@/app/features/google-drive/types/googleDrive'

export const googleDriveApi = {
	fetchFiles: async (
		query?: string,
	): Promise<FetchGoogleDriveFilesResponse> => {
		const url = query
			? `/api/googleapis?q=${encodeURIComponent(query)}`
			: '/api/googleapis'

		try {
			const response = await fetch(url)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(
					data.error || 'Google Driveファイルの取得に失敗しました',
				)
			}

			return data
		} catch (error) {
			const apiError = error as GoogleDriveApiError
			if (apiError.code === 401 || apiError.status === 401) {
				throw new Error(
					'認証の有効期限が切れました。再度ログインしてください。',
				)
			}
			throw new Error(
				apiError.message || 'Google Driveファイルの取得に失敗しました',
			)
		}
	},
}
