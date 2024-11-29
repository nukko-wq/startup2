import { EllipsisVertical, FilePlus, Trash2 } from 'lucide-react'
import {
	Button,
	MenuItem,
	MenuTrigger,
	Popover,
	Menu,
} from 'react-aria-components'
import { closeAllTabs } from '@/app/features/tabs/tabsSlice'

const TabsMenu = () => {
	const handleCloseAllTabs = async () => {
		try {
			await closeAllTabs()
		} catch (error) {
			console.error('Failed to close all tabs:', error)
		}
	}

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
					<Menu className="bg-zinc-50 outline-none border rounded-lg shadow-md min-w-[200px]">
						<MenuItem
							onAction={() => {}}
							className="p-2 outline-none hover:bg-zinc-200 cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<FilePlus className="w-4 h-4" />
								Sort by domain
							</div>
						</MenuItem>
						<MenuItem
							className="p-2 outline-none hover:bg-zinc-200 text-red-600 cursor-pointer"
							onAction={handleCloseAllTabs}
						>
							<div className="flex items-center gap-2">
								<Trash2 className="w-4 h-4" />
								Close all tabs
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>
		</>
	)
}

export default TabsMenu
