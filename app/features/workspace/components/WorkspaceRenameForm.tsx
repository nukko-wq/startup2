'use client'

import { Controller, useForm } from 'react-hook-form'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { useDispatch } from 'react-redux'
import {
	renameWorkspace,
	renameWorkspaceOptimistically,
	fetchWorkspaces,
} from '@/app/features/workspace/workspaceSlice'
import type { AppDispatch } from '@/app/store/store'
import { useState, useEffect } from 'react'

interface WorkspaceRenameFormProps {
	workspaceId: string
	initialName: string
	onClose: () => void
}

interface FormData {
	name: string
}

const WorkspaceRenameForm = ({
	workspaceId,
	initialName,
	onClose,
}: WorkspaceRenameFormProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const { control, handleSubmit, setValue } = useForm<FormData>({
		defaultValues: {
			name: initialName,
		},
	})

	useEffect(() => {
		setValue('name', initialName)
	}, [initialName, setValue])

	const onSubmit = async (data: FormData) => {
		if (!data.name.trim()) return

		setIsSubmitting(true)
		try {
			dispatch(
				renameWorkspaceOptimistically({
					workspaceId,
					name: data.name.trim(),
				}),
			)
			onClose()

			await dispatch(
				renameWorkspace({
					workspaceId,
					name: data.name.trim(),
				}),
			).unwrap()
		} catch (error) {
			console.error('ワークスペース名の変更に失敗しました:', error)
			dispatch(fetchWorkspaces())
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
							onFocus={(e) => {
								const input = e.target as HTMLInputElement
								const length = input.value.length
								input.setSelectionRange(length, length)
							}}
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
					type="button"
					onPress={onClose}
					className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 outline-none"
					isDisabled={isSubmitting}
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 outline-none flex items-center gap-2"
					isDisabled={isSubmitting}
				>
					{isSubmitting ? '更新中...' : '保存'}
				</Button>
			</div>
		</Form>
	)
}

export default WorkspaceRenameForm
