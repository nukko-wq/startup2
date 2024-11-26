'use client'

import { Plus, SquarePlus } from 'lucide-react'
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
import { useState } from 'react'
import WorkspaceCreateForm from '@/app/components/workspace/WorkspaceCreateForm'
const DefaultWorkSpaceRightMenu = () => {
	const [isOpen, setIsOpen] = useState(false)

	const handleNewWorkspace = () => {
		setIsOpen(true)
	}

	return (
		<>
			<MenuTrigger>
				<Button className="outline-none p-1 mr-2 bg-gray-700 hover:bg-gray-600 transition-colors duration-200 rounded-full">
					<Plus className="w-5 h-5 text-zinc-50" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border shadow-md min-w-[200px] rounded-sm">
						<MenuItem className="p-2 outline-none hover:bg-zinc-200 cursor-pointer">
							<div className="flex items-center gap-2 text-zinc-800">
								<SquarePlus className="w-4 h-4" />
								<span>New Space</span>
							</div>
						</MenuItem>
						<MenuItem
							onAction={handleNewWorkspace}
							className="p-2 outline-none hover:bg-zinc-200 cursor-pointer"
						>
							<div className="flex items-center gap-2 text-zinc-800">
								<SquarePlus className="w-4 h-4" />
								<span>New Workspace</span>
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
				<Button className="hidden">Open Dialog</Button>
				<ModalOverlay className="fixed inset-0 bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur">
					<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
						<Dialog className="outline-none">
							<div>
								<h2 className="text-lg font-semibold mb-4">
									新しいワークスペースを作成
								</h2>
								<WorkspaceCreateForm onClose={() => setIsOpen(false)} />
							</div>
						</Dialog>
					</Modal>
				</ModalOverlay>
			</DialogTrigger>
		</>
	)
}

export default DefaultWorkSpaceRightMenu
