import { Earth } from 'lucide-react'
import React, { useState } from 'react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/app/store/store'
import {
	updateResource,
	updateResourceOptimistically,
	fetchResources,
} from '@/app/features/resource/resourceSlice'
import type { Resource } from '@prisma/client'

interface ResourceEditFormProps {
	resource: Resource
	onClose: () => void
}

interface ResourceFormData {
	title: string
	url: string
	description?: string
}

const ResourceEditForm = ({ resource, onClose }: ResourceEditFormProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const {
		control,
		handleSubmit,
		formState: { isValid },
	} = useForm<ResourceFormData>({
		defaultValues: {
			title: resource.title,
			url: resource.url,
			description: resource.description || '',
		},
	})

	const onSubmit = async (data: ResourceFormData) => {
		try {
			setIsSubmitting(true)

			// 楽観的更新を適用
			const optimisticUpdate = {
				...resource,
				title: data.title,
				url: data.url,
				description: data.description,
			}
			dispatch(
				updateResourceOptimistically({
					sectionId: resource.sectionId,
					updatedResource: optimisticUpdate,
				}),
			)
			onClose()

			// APIリクエストを実行
			await dispatch(
				updateResource({
					id: resource.id,
					title: data.title,
					url: data.url,
					description: data.description,
				}),
			).unwrap()
		} catch (error) {
			console.error('リソースの更新に失敗しました:', error)
			// エラーが発生した場合、fetchResourcesを呼び出して状態を同期
			dispatch(fetchResources(resource.sectionId))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow">
			<div className="flex items-center gap-2 border-b border-gray-200">
				<div className="border border-gray-200 rounded-sm ml-4 w-8 h-8 flex items-center justify-center">
					<Earth className="w-4 h-4 text-zinc-700" />
				</div>
				<Controller
					name="title"
					control={control}
					rules={{ required: true }}
					render={({ field: { value, onChange, onBlur } }) => (
						<Input
							value={value}
							onChange={onChange}
							onBlur={onBlur}
							type="text"
							className="w-full py-4 px-2 rounded-t-lg outline-none text-lg"
							aria-label="Name"
						/>
					)}
				/>
			</div>
			<div className="flex flex-col px-[40px] py-[32px] gap-2">
				<div>
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
								aria-label="URL"
							/>
						)}
					/>
				</div>
				<div>
					<TextField>
						<Label className="text-sm">Description</Label>
						<Controller
							name="description"
							control={control}
							render={({ field: { value, onChange, onBlur } }) => (
								<Input
									value={value}
									onChange={onChange}
									onBlur={onBlur}
									type="text"
									className="w-full p-2 border rounded mt-1 focus:outline-blue-500"
									aria-label="Description"
								/>
							)}
						/>
					</TextField>
				</div>
				<div className="mt-[40px] flex gap-2 justify-end">
					<Button
						type="button"
						onPress={onClose}
						className="px-4 py-2 text-sm border rounded hover:bg-gray-50 outline-none"
					>
						キャンセル
					</Button>
					<Button
						type="submit"
						isDisabled={!isValid || isSubmitting}
						className="px-4 py-2 text-sm border rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 outline-none"
					>
						{isSubmitting ? '保存中...' : '保存'}
					</Button>
				</div>
			</div>
		</Form>
	)
}

export default ResourceEditForm
