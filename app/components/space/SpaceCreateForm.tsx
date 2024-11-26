import React, { useState, useEffect } from 'react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { createSpace } from '@/app/features/space/spaceSlice'

interface SpaceCreateFormProps {
	onClose: () => void
}

interface FormData {
	name: string
}

const SpaceCreateForm = ({ onClose }: SpaceCreateFormProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const activeWorkspaceId = useSelector(
		(state: RootState) => state.workspace.activeWorkspaceId,
	)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// デバッグ用
	useEffect(() => {
		console.log('Active Workspace ID:', activeWorkspaceId)
	}, [activeWorkspaceId])

	const {
		control,
		handleSubmit,
		formState: { isValid },
	} = useForm<FormData>({
		defaultValues: {
			name: '',
		},
		mode: 'onChange',
	})

	const onSubmit = async (data: FormData) => {
		if (!activeWorkspaceId) {
			console.error('No active workspace selected')
			return
		}
		setIsSubmitting(true)

		try {
			console.log('Creating space with:', {
				name: data.name,
				workspaceId: activeWorkspaceId,
			})

			await dispatch(
				createSpace({
					name: data.name,
					workspaceId: activeWorkspaceId,
				}),
			).unwrap()
			onClose()
		} catch (error) {
			console.error('Failed to create space:', error)
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
					required: 'スペース名は必須です',
					minLength: { value: 1, message: 'スペース名を入力してください' },
				}}
				render={({ field, fieldState }) => (
					<TextField
						isInvalid={!!fieldState.error}
						autoFocus
						className="space-y-[2px]"
					>
						<Label className="text-sm">スペース名</Label>
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
					type="button"
					onPress={onClose}
					className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 outline-none"
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					isDisabled={!isValid || isSubmitting}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 outline-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? '作成中...' : '作成'}
				</Button>
			</div>
		</Form>
	)
}

export default SpaceCreateForm
