'use client'

import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { renameSection } from '@/app/features/section/sectionSlice'
import type { AppDispatch, RootState } from '@/app/store/store'
import type { Section } from '@/app/features/section/sectionSlice'
import {
	Button,
	Dialog,
	DialogTrigger,
	Form,
	Input,
	Modal,
	ModalOverlay,
	TextField,
} from 'react-aria-components'
import { useForm, Controller } from 'react-hook-form'

interface SectionNameEditProps {
	section: Section
}

interface FormData {
	name: string
}

const SectionNameEdit = ({ section }: SectionNameEditProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const [isOpen, setIsOpen] = useState(false)
	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)
	const { control, handleSubmit, reset } = useForm<FormData>({
		defaultValues: {
			name: section.name,
		},
	})

	const onSubmit = async (data: FormData) => {
		if (!activeSpaceId) return

		try {
			await dispatch(
				renameSection({
					sectionId: section.id,
					name: data.name,
					spaceId: activeSpaceId,
				}),
			).unwrap()
			setIsOpen(false)
		} catch (error) {
			console.error('セクション名の変更に失敗しました:', error)
		}
	}

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
			<Button
				aria-label="Edit"
				className="text-[17px] outline-none px-3 py-2 hover:bg-zinc-100 rounded"
			>
				<span>{section.name}</span>
			</Button>

			<ModalOverlay
				isDismissable
				className="fixed flex top-0 left-0 w-screen h-screen z-100 bg-black/20 items-center justify-center"
			>
				<Modal className="flex items-center justify-center outline-none">
					<Dialog className="outline-none">
						<Form onSubmit={handleSubmit(onSubmit)}>
							<TextField autoFocus>
								<Controller
									name="name"
									control={control}
									rules={{ required: true }}
									render={({ field: { value, onChange, onBlur } }) => (
										<Input
											aria-label="Section name"
											value={value}
											onChange={onChange}
											onBlur={onBlur}
											className="text-xl font-semibold text-zinc-700 bg-slate-50 hover:bg-slate-50 px-2 py-1 rounded outline-none w-full"
										/>
									)}
								/>
							</TextField>
						</Form>
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default SectionNameEdit
