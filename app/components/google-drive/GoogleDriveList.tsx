import { Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button, Input } from 'react-aria-components'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchGoogleDriveFiles } from '@/app/features/googleDrive/googleDriveSlice'
import { useDebounce } from '@/app/hooks/useDebounce'
import GoogleDriveListIcon from '@/app/components/google-drive/GoogleDriveListIcon'

interface GoogleDriveListProps {
	onSelect?: (file: {
		title: string
		url: string
		mimeType: string
		description: string
		isGoogleDrive: boolean
	}) => void
}

interface GoogleDriveFile {
	id: string
	name: string
	webViewLink: string
	mimeType: string
}

const GoogleDriveList = ({ onSelect }: GoogleDriveListProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const { files, loading, error } = useSelector(
		(state: RootState) => state.googleDrive,
	)
	const [searchQuery, setSearchQuery] = useState('')
	const debouncedQuery = useDebounce(searchQuery, 500)

	const getGoogleDriveDescription = (mimeType: string): string => {
		switch (mimeType) {
			case 'application/vnd.google-apps.document':
				return 'Google Doc'
			case 'application/vnd.google-apps.spreadsheet':
				return 'Google Sheet'
			case 'application/vnd.google-apps.presentation':
				return 'Google Slide'
			case 'application/vnd.google-apps.form':
				return 'Google Form'
			default:
				return 'Google Drive'
		}
	}

	useEffect(() => {
		dispatch(fetchGoogleDriveFiles(debouncedQuery))
	}, [dispatch, debouncedQuery])

	const handleFileSelect = (file: {
		name: string
		webViewLink: string
		mimeType: string
	}) => {
		const description = getGoogleDriveDescription(file.mimeType)

		onSelect?.({
			title: file.name,
			url: file.webViewLink,
			mimeType: file.mimeType,
			description: description,
			isGoogleDrive: true,
		})
	}

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-center py-2">
				<Search className="w-[20px] h-[20px] text-zinc-700 ml-4 mr-2" />
				<Input
					className="w-[400px] text-zinc-700 outline-none"
					placeholder="Search Drive for resouces to add..."
					aria-label="Search Drive"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>
			<div
				className="flex flex-col flex-grow w-[400px] h-[428px] border-l"
				aria-label="Recent Google Drive Files"
			>
				<div className="flex items-center justify-center h-[17px]">
					<div className="border-t border-zinc-200 flex-grow" />
					<h2 className="text-sm text-zinc-500 px-4">Recent</h2>
					<div className="border-t border-zinc-200 flex-grow" />
				</div>
				{loading ? (
					<div className="flex flex-grow items-center justify-center">
						<div className="text-zinc-700">読み込み中...</div>
					</div>
				) : error ? (
					<div className="p-4 text-center text-red-500">{error}</div>
				) : (
					<div className="overflow-y-auto overflow-x-hidden">
						<ul className="flex flex-col">
							{files.map((file) => (
								<li
									key={file.id}
									className="h-[40px] flex items-center hover:bg-zinc-100 cursor-pointer group/item"
								>
									<Button
										onPress={() => handleFileSelect(file)}
										className="w-full p-2 outline-none"
									>
										<div className="flex items-center gap-2">
											<GoogleDriveListIcon mimeType={file.mimeType} />
											<span className="truncate text-sm">{file.name}</span>
										</div>
									</Button>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	)
}

export default GoogleDriveList
