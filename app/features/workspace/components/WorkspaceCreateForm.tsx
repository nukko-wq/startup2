'use client'

import { useForm, Controller } from 'react-hook-form'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { useDispatch } from 'react-redux'
import { createWorkspace } from '@/app/features/workspace/workspaceSlice'
import type { AppDispatch } from '@/app/store/store'
import { useState } from 'react'

interface FormData {
	name: string
}

const WorkspaceCreateForm = ({ onClose }: { onClose: () => void }) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		control,
		register,
		handleSubmit,
		formState: { isValid },
	} = useForm<FormData>({
		defaultValues: {
			name: '',
		},
		mode: 'onChange',
	})

	const onSubmit = async (data: FormData) => {
		try {
			await dispatch(createWorkspace(data.name)).unwrap()
			onClose()
		} catch (error) {
			console.error('Failed to create workspace:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<Controller
				name="name"
				control={control}
				rules={{ required: 'Name is required' }}
				render={({ field, fieldState }) => (
					<TextField
						isInvalid={!!fieldState.error}
						autoFocus
						className="space-y-[2px]"
					>
						<Label className="text-sm">Workspace Name</Label>
						<Input
							{...field}
							className="w-full px-3 py-2 border rounded focus:outline-blue-500"
						/>
						{fieldState.error && (
							<span className="text-red-500 text-sm">
								{fieldState.error.message}
							</span>
						)}
					</TextField>
				)}
			/>

			<div className="flex justify-end gap-2">
				<Button
					onPress={onClose}
					type="button"
					className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 outline-none"
				>
					キャンセル
				</Button>
				<Button
					type="submit"
					isDisabled={!isValid || isSubmitting}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 outline-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					作成
				</Button>
			</div>
		</Form>
	)
}

export default WorkspaceCreateForm
