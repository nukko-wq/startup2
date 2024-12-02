'use client'

import { Controller, useForm } from 'react-hook-form'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { useDispatch } from 'react-redux'
import { renameWorkspace } from '@/app/features/workspace/workspaceSlice'
import type { AppDispatch } from '@/app/store/store'
import { useState } from 'react'

interface WorkspaceRenameFormProps {
	workspaceId: string
	currentName: string
	onClose: () => void
}

interface FormData {
	name: string
}

const WorkspaceRenameForm = ({
	workspaceId,
	currentName,
	onClose,
}: WorkspaceRenameFormProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			name: currentName,
		},
	})

	const onSubmit = async (data: FormData) => {
		try {
			setIsSubmitting(true)
			await dispatch(
				renameWorkspace({
					workspaceId,
					name: data.name,
				}),
			).unwrap()
			onClose()
		} catch (error) {
			console.error('Failed to rename workspace:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<Controller
				name="name"
				control={control}
				rules={{
					required: 'ワークスペース名は必須です',
					minLength: {
						value: 1,
						message: 'ワークスペース名を入力してください',
					},
				}}
				render={({ field, fieldState }) => (
					<TextField
						isInvalid={!!fieldState.error}
						autoFocus
						className="space-y-[2px]"
					>
						<Label className="text-sm">ワークスペース名</Label>
						<Input
							{...field}
							className="w-full px-3 py-2 border rounded focus:outline-blue-500"
						/>
						{fieldState.error && (
							<div className="text-red-500 text-sm">
								{fieldState.error.message}
							</div>
						)}
					</TextField>
				)}
			/>

			<div className="flex justify-end gap-2">
				<Button
					onPress={onClose}
					type="button"
					className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 outline-none"
					isDisabled={isSubmitting}
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 outline-none"
					isDisabled={isSubmitting}
				>
					{isSubmitting ? '保存中...' : '保存'}
				</Button>
			</div>
		</Form>
	)
}

export default WorkspaceRenameForm
