import React from 'react'
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
import { Controller } from 'react-hook-form'

const SectionNameEdit = () => {
	return (
		<DialogTrigger>
			<Button aria-label="Edit" className="text-[17px] outline-none px-3 py-2">
				<span>Section Name</span>
			</Button>
			<ModalOverlay
				isDismissable
				className="fixed flex top-0 left-0 w-screen h-screen z-100 bg-black/20 items-center justify-center"
			>
				<Modal className="flex items-center justify-center outline-none">
					<Dialog className="outline-none">
						<Form>
							<TextField autoFocus>
								<Controller
									name="name"
									render={({ field: { value, onChange, onBlur } }) => (
										<Input
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
