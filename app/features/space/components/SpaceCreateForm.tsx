import React, { useState } from 'react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import {
	createSpace,
	setActiveSpace,
	addSpaceOptimistically,
	removeSpaceOptimistically,
} from '@/app/features/space/spaceSlice'
import { createSection } from '@/app/features/section/sectionSlice'
import { v4 as uuidv4 } from 'uuid'
import type { Space } from '@/app/features/space/types/space'

interface SpaceCreateFormProps {
	onClose: () => void
	workspaceId: string
}

interface FormData {
	name: string
}

const SpaceCreateForm = ({ onClose, workspaceId }: SpaceCreateFormProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const existingSpaces = useSelector(
		(state: RootState) =>
			state.space.spacesByWorkspace[workspaceId]?.spaces || [],
	)

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
		setIsSubmitting(true)
		const optimisticId = uuidv4()

		// 楽観的に追加するスペースを作成
		const optimisticSpace: Space = {
			id: optimisticId,
			name: data.name,
			order: existingSpaces.length,
			workspaceId,
			isLastActive: false,
		}

		try {
			// 楽観的更新
			dispatch(
				addSpaceOptimistically({
					workspaceId,
					space: optimisticSpace,
				}),
			)

			onClose()
			// 実際のAPI呼び出し
			const result = await dispatch(
				createSpace({
					name: data.name,
					workspaceId,
					optimisticId: optimisticId,
				}),
			).unwrap()

			// セクションの作成
			try {
				await dispatch(
					createSection({
						spaceId: result.space.id,
						optimisticId: uuidv4(),
					}),
				).unwrap()

				try {
					await dispatch(setActiveSpace(result.space.id)).unwrap()
					onClose()
				} catch (activeError) {
					console.error('Failed to set active space:', activeError)
				}
			} catch (sectionError) {
				console.error('Failed to create section:', sectionError)
			}
		} catch (spaceError) {
			console.error('Failed to create space:', spaceError)
			// エラー時に楽観的に追加したスペースを削除
			dispatch(
				removeSpaceOptimistically({
					workspaceId,
					spaceId: optimisticId,
				}),
			)
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
					className="px-4 py-2 border rounded hover:bg-gray-50 outline-none"
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
