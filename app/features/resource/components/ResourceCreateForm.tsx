import React, { useRef, useState } from 'react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import IconGoogle from '@/app/components/elements/IconGoogle'
import { Controller, useForm } from 'react-hook-form'
import { Link } from 'lucide-react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/app/store/store'
import {
	createResource,
	addResourceOptimistically,
} from '@/app/features/resource/resourceSlice'
import GoogleDriveList from '@/app/features/google-drive/components/GoogleDriveList'
import { v4 as uuidv4 } from 'uuid'

interface ResourceFormData {
	url: string
	title: string
}

interface Props {
	sectionId: string
	onClose: () => void
}

const ResourceCreateForm = ({ sectionId, onClose }: Props) => {
	const dispatch = useDispatch<AppDispatch>()

	// タブの状態管理
	const [activeTab, setActiveTab] = useState<'url' | 'drive'>('url')

	// フォームの制御
	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting, isValid },
	} = useForm<ResourceFormData>({
		defaultValues: {
			url: '',
			title: '',
		},
		mode: 'onChange',
	})

	// 入力フィールドの参照
	const urlInputRef = useRef<HTMLInputElement>(null)
	const searchInputRef = useRef<HTMLInputElement>(null)

	// ダァイルタイプに応じたアイコンを返す関数
	const getFileIcon = (mimeType: string) => {
		// TODO: mimeTypeに応じて適切なアイコンを返す
		return <IconGoogle variant="drive" className="w-[20px] h-[20px]" />
	}

	// フォームの送信処理
	const onSubmit = async (data: ResourceFormData) => {
		try {
			// 楽観的更新用の一時的なIDを生成
			const optimisticId = uuidv4()

			// faviconURLを取得
			const faviconResponse = await fetch(
				`/api/favicon?url=${encodeURIComponent(data.url)}`,
			)
			const faviconData = await faviconResponse.json()

			// 楽観的に追加するリソースを作成
			const optimisticResource = {
				id: optimisticId,
				title: data.title || new URL(data.url).hostname,
				url: data.url,
				sectionId,
				faviconUrl: faviconData.faviconUrl,
				order: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			// 楽観的更新を実行
			dispatch(
				addResourceOptimistically({
					sectionId,
					resource: optimisticResource,
				}),
			)

			// フォームをリセットして閉じる（楽観的更新の直後に実行）
			reset()
			onClose()

			// 実際のAPI呼び出し（バックグラウンドで実行）
			await dispatch(
				createResource({
					title: optimisticResource.title,
					url: data.url,
					sectionId,
					faviconUrl: faviconData.faviconUrl,
					optimisticId,
				}),
			).unwrap()
		} catch (error) {
			console.error('リソースの作成に失敗しました:', error)
		}
	}

	const handleGoogleDriveFileSelect = async (file: {
		title: string
		url: string
		mimeType: string
		description: string
		isGoogleDrive: boolean
	}) => {
		try {
			// 楽観的更新用の一時的なIDを生成
			const optimisticId = uuidv4()

			// 楽観的に追加するリソースを作成
			const optimisticResource = {
				id: optimisticId,
				title: file.title,
				url: file.url,
				sectionId,
				mimeType: file.mimeType,
				description: file.description,
				isGoogleDrive: true,
				order: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			// 楽観的更新を実行
			dispatch(
				addResourceOptimistically({
					sectionId,
					resource: optimisticResource,
				}),
			)

			// フォームを閉じる（楽観的更新の直後に実行）
			onClose()

			// 実際のAPI呼び出し（バックグラウンドで実行）
			await dispatch(
				createResource({
					title: file.title,
					url: file.url,
					sectionId,
					mimeType: file.mimeType,
					description: file.description,
					isGoogleDrive: true,
					optimisticId,
				}),
			).unwrap()
		} catch (error) {
			console.error('リソースの作成に失敗しました:', error)
		}
	}

	return (
		<div className="flex w-full md:w-[600px] h-[468px]">
			<div
				className="hidden md:block min-w-[200px] bg-zinc-100"
				aria-label="Side Menu"
			>
				<div className="text-xl font-bold p-4 text-zinc-700">Add Resource</div>
				<Button
					className={`w-full text-muted-foreground p-2 flex items-center gap-2 outline-none ${
						activeTab === 'url' ? 'bg-zinc-200' : ''
					}`}
					onPress={() => setActiveTab('url')}
					aria-label="URL"
				>
					<Link className="w-[20px] h-[20px]" />
					<div>URL</div>
				</Button>
				<Button
					className={`w-full text-muted-foreground p-2 flex items-center gap-1 outline-none ${
						activeTab === 'drive' ? 'bg-zinc-200' : ''
					}`}
					onPress={() => setActiveTab('drive')}
					aria-label="Google Drive"
				>
					<div className="flex items-center gap-2">
						<IconGoogle variant="drive" className="w-[20px] h-[20px]" />
						<div className="">Google Drive</div>
					</div>
				</Button>
			</div>
			{activeTab === 'url' && (
				<Form
					onSubmit={handleSubmit(onSubmit)}
					className=""
					aria-label="URL Form"
				>
					<div className="flex flex-col p-9 space-y-4 w-[400px]">
						<div className="">
							<TextField>
								<Label className="text-sm">URL</Label>
								<Controller
									name="url"
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<Input
											value={value}
											onChange={onChange}
											onBlur={onBlur}
											type="url"
											className="w-full p-2 border rounded mt-1 focus:outline-blue-500"
											placeholder="https://example.com"
											aria-label="URL"
											ref={urlInputRef}
										/>
									)}
								/>
							</TextField>
						</div>
						<div className="">
							<TextField>
								<Label className="text-sm">Name</Label>
								<Controller
									name="title"
									control={control}
									render={({ field: { value, onChange, onBlur } }) => (
										<Input
											value={value}
											onChange={onChange}
											onBlur={onBlur}
											type="text"
											className="w-full p-2 border-gray-200 rounded border focus:outline-blue-500"
											placeholder="Name"
											aria-label="Name"
										/>
									)}
								/>
							</TextField>
						</div>
						<div className="flex justify-between">
							<Button
								type="button"
								onPress={onClose}
								className="px-4 py-2 text-sm border rounded hover:bg-gray-200 focus:outline-blue-500"
							>
								キャンセル
							</Button>
							<Button
								type="submit"
								isDisabled={isSubmitting || !isValid}
								className="px-4 py-2 text-sm border rounded bg-blue-500 disabled:opacity-50 text-white hover:bg-blue-600 focus:outline-blue-500"
							>
								{isSubmitting ? '作成中...' : 'ADD RESOURCE'}
							</Button>
						</div>
					</div>
				</Form>
			)}
			{activeTab === 'drive' && (
				<GoogleDriveList onSelect={handleGoogleDriveFileSelect} />
			)}
		</div>
	)
}

export default ResourceCreateForm
