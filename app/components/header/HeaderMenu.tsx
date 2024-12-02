import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'
import SpaceDeleteDialog from '@/app/features/space/components/SpaceDeleteDialog'
import SpaceRenameDialog from '@/app/features/space/components/SpaceRenameDialog'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'

const HeaderMenu = () => {
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	// 現在のアクティブなスペースの情報を取得
	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)
	const activeSpace = useSelector((state: RootState) => {
		if (!activeSpaceId) return null
		for (const workspace of Object.values(state.space.spacesByWorkspace)) {
			const space = workspace.spaces.find((s) => s.id === activeSpaceId)
			if (space) return space
		}
		return null
	})

	if (!activeSpace) return null

	return (
		<>
			<MenuTrigger>
				<Button
					aria-label="More options"
					className="p-2 hover:bg-zinc-200 rounded-full outline-none transition-colors duration-200"
				>
					<EllipsisVertical className="w-5 h-5 text-zinc-700" />
				</Button>
				<Popover>
					<Menu className="bg-zinc-50 outline-none border rounded-lg shadow-md min-w-[200px] text-sm">
						<MenuItem
							onAction={() => setIsRenameDialogOpen(true)}
							className="pl-3 pr-2 py-2 outline-none hover:bg-zinc-100 cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<Pencil className="w-4 h-4" />
								Rename
							</div>
						</MenuItem>
						<MenuItem
							onAction={() => setIsDeleteDialogOpen(true)}
							className="pl-3 pr-2 py-2 outline-none hover:bg-zinc-100 cursor-pointer text-red-600"
						>
							<div className="flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								Delete
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>

			{/* Rename Dialog */}
			<SpaceRenameDialog
				isOpen={isRenameDialogOpen}
				onOpenChange={setIsRenameDialogOpen}
				spaceId={activeSpace.id}
				workspaceId={activeSpace.workspaceId}
				currentSpaceName={activeSpace.name}
			/>

			{/* Delete Dialog */}
			<SpaceDeleteDialog
				isOpen={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				spaceId={activeSpace.id}
				workspaceId={activeSpace.workspaceId}
			/>
		</>
	)
}

export default HeaderMenu
