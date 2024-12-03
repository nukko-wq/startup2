export interface GoogleDriveFile {
	id: string
	name: string
	webViewLink: string
	mimeType: string
}

export interface GoogleDriveState {
	files: GoogleDriveFile[]
	loading: boolean
	error: string | null
}

export interface FetchGoogleDriveFilesResponse {
	files: GoogleDriveFile[]
}

export interface GoogleDriveApiError {
	message: string
}
