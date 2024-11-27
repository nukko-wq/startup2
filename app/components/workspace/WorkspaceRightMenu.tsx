import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'
import WorkspaceRenameDialog from './WorkspaceRenameDialog'
import WorkspaceDeleteDialog from './WorkspaceDeleteDialog'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'

interface WorkspaceRightMenuProps {
	workspaceId: string
}

const WorkspaceRightMenu = ({ workspaceId }: WorkspaceRightMenuProps) => {
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const workspace = useSelector((state: RootState) =>
		state.workspace.workspaces.find((w) => w.id === workspaceId),
	)

	return (
		<>
			<MenuTrigger>
				<Button className="outline-none p-1 mr-2 group-hover:bg-gray-700 transition duration-200 rounded-full opacity-0 group-hover:opacity-100">
					<EllipsisVertical className="w-5 h-5 text-zinc-50" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-sm shadow-md min-w-[160px]">
						<MenuItem
							className="pl-4 pr-4 py-2 outline-none hover:cursor-pointer"
							onAction={() => setIsRenameDialogOpen(true)}
						>
							<div className="flex items-center gap-3">
								<Pencil className="w-4 h-4" />
								<span>Rename</span>
							</div>
						</MenuItem>
						<MenuItem
							onAction={() => setIsDeleteDialogOpen(true)}
							className="pl-4 pr-5 py-2 outline-none hover:bg-zinc-100 text-red-600 hover:cursor-pointer text-sm"
						>
							<div className="flex items-center gap-3">
								<Trash2 className="w-4 h-4" />
								<span>Delete</span>
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			{workspace && (
				<WorkspaceRenameDialog
					isOpen={isRenameDialogOpen}
					onOpenChange={setIsRenameDialogOpen}
					workspaceId={workspaceId}
					currentName={workspace.name}
				/>
			)}
			<WorkspaceDeleteDialog
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				workspaceId={workspaceId}
			/>
		</>
	)
}

export default WorkspaceRightMenu
