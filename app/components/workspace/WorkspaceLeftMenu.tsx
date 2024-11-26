import { Plus, SquarePlus } from 'lucide-react'
import React, { useState } from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Menu,
	MenuItem,
	MenuTrigger,
	Modal,
	ModalOverlay,
	Popover,
} from 'react-aria-components'
import SpaceCreateForm from '@/app/components/space/SpaceCreateForm'
const WorkspaceLeftMenu = () => {
	const [isOpen, setIsOpen] = useState(false)
	return (
		<>
			<MenuTrigger>
				<Button className="outline-none p-1 mr-2 group-hover:bg-gray-700 transition duration-200 rounded-full opacity-0 group-hover:opacity-100">
					<Plus className="w-5 h-5 text-zinc-50" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-sm shadow-md min-w-[160px]">
						<MenuItem
							className="pl-4 pr-4 py-2 outline-none hover:cursor-pointer"
							onAction={() => setIsOpen(true)}
							aria-label="New Space"
						>
							<div className="flex items-center gap-3 text-sm">
								<SquarePlus className="w-4 h-4" />
								<span>New Space</span>
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
				<ModalOverlay className="fixed inset-0 bg-black/30 flex items-center justify-center">
					<Modal className="bg-white p-6 rounded-lg">
						<Dialog className="outline-none">
							{({ close }) => <SpaceCreateForm onClose={close} />}
						</Dialog>
					</Modal>
				</ModalOverlay>
			</DialogTrigger>
		</>
	)
}

export default WorkspaceLeftMenu
