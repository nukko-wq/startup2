'use client'

import { EllipsisVertical, FilePlus, Trash2 } from 'lucide-react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import SectionDeleteDialog from '@/app/features/section/components/SectionDeleteDialog'
import { useState } from 'react'

interface SectionMenuProps {
	sectionId: string
}

const SectionMenu = ({ sectionId }: SectionMenuProps) => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="Menu"
					className="outline-none p-2 hover:bg-zinc-200 transition-colors duration-200 rounded-full"
				>
					<EllipsisVertical className="w-6 h-6 text-zinc-700" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-lg shadow-md min-w-[200px] text-sm">
						<MenuItem
							id="add-resource"
							className="pl-3 pr-2 py-2 outline-none hover:bg-zinc-100 cursor-pointer rounded-t-lg"
						>
							<div className="flex items-center gap-2">
								<FilePlus className="w-4 h-4" />
								Add a resource
							</div>
						</MenuItem>
						<MenuItem
							id="delete-section"
							className="pl-3 pr-2 py-2 outline-none hover:bg-zinc-100 text-red-600 cursor-pointer rounded-b-lg"
							onAction={() => setIsDeleteDialogOpen(true)}
						>
							<div className="flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								Delete section
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			<SectionDeleteDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				sectionId={sectionId}
			/>
		</>
	)
}

export default SectionMenu
