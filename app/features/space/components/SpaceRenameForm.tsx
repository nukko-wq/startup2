import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import {
	renameSpace,
	renameSpaceOptimistically,
	fetchSpaces,
} from '@/app/features/space/spaceSlice'
import type { AppDispatch } from '@/app/store/store'

interface SpaceRenameFormProps {
	spaceId: string
	workspaceId: string
	initialName: string
	onClose: () => void
}

interface FormData {
	name: string
}

const SpaceRenameForm = ({
	spaceId,
	workspaceId,
	initialName,
	onClose,
}: SpaceRenameFormProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const { control, handleSubmit } = useForm<FormData>({
		defaultValues: {
			name: initialName,
		},
	})

	const onSubmit = async (data: FormData) => {
		if (!data.name.trim()) return

		setIsSubmitting(true)
		try {
			// 楽観的更新を適用
			dispatch(
				renameSpaceOptimistically({
					workspaceId,
					spaceId,
					name: data.name.trim(),
				}),
			)

			onClose()

			// APIリクエストを実行
			await dispatch(
				renameSpace({
					spaceId,
					name: data.name.trim(),
					workspaceId,
				}),
			).unwrap()
		} catch (error) {
			console.error('スペース名の変更に失敗しました:', error)
			// エラー時は状態を同期
			dispatch(fetchSpaces(workspaceId))
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

export default SpaceRenameForm
