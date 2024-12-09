'use client'

import { useForm, Controller } from 'react-hook-form'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { useDispatch, useSelector } from 'react-redux'
import {
	createWorkspace,
	addWorkspaceOptimistically,
	removeWorkspaceOptimistically,
} from '@/app/features/workspace/workspaceSlice'
import type { AppDispatch, RootState } from '@/app/store/store'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Workspace } from '@/app/features/workspace/types/workspace'

interface FormData {
	name: string
}

const WorkspaceCreateForm = ({ onClose }: { onClose: () => void }) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const existingWorkspaces = useSelector(
		(state: RootState) => state.workspace.workspaces,
	)

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
		setIsSubmitting(true)
		const optimisticId = uuidv4()

		// 楽観的に追加するワークスペースを作成
		const optimisticWorkspace: Workspace = {
			id: optimisticId,
			name: data.name,
			order: existingWorkspaces.length,
			isDefault: false,
			userId: '', // 仮の値
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			spaces: [], // 追加: 新規ワークスペースは空の配列で初期化
		}

		try {
			// 楽観的更新
			dispatch(addWorkspaceOptimistically(optimisticWorkspace))

			onClose()

			// 実際のAPI呼び出し
			await dispatch(
				createWorkspace({
					name: data.name,
					optimisticId,
				}),
			).unwrap()
		} catch (error) {
			console.error('Failed to create workspace:', error)
			// エラー時に楽観的に追加したワークスペースを削除
			dispatch(removeWorkspaceOptimistically(optimisticId))
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
