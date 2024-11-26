'use client'

import { useForm } from 'react-hook-form'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { useDispatch } from 'react-redux'
import { createWorkspace } from '@/app/features/workspace/workspaceSlice'
import type { AppDispatch } from '@/app/store/store'
import { Loader2 } from 'lucide-react'

interface FormData {
	name: string
}

const WorkspaceCreateForm = ({ onClose }: { onClose: () => void }) => {
	const dispatch = useDispatch<AppDispatch>()
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>()

	const onSubmit = async (data: FormData) => {
		try {
			await dispatch(createWorkspace(data.name)).unwrap()
			onClose()
		} catch (error) {
			console.error('Failed to create workspace:', error)
		}
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<TextField autoFocus className="space-y-[2px]">
				<Label className="text-sm">Workspace Name</Label>
				<Input
					{...register('name', { required: 'Name is required' })}
					className="w-full px-3 py-2 border rounded focus:outline-blue-500"
				/>
				{errors.name && (
					<span className="text-red-500 text-sm">{errors.name.message}</span>
				)}
			</TextField>

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
					className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 outline-none"
				>
					作成
				</Button>
			</div>
		</Form>
	)
}

export default WorkspaceCreateForm
