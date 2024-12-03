import { EllipsisVertical, FilePlus, Trash2 } from 'lucide-react'
import {
	Button,
	MenuItem,
	MenuTrigger,
	Popover,
	Menu,
} from 'react-aria-components'
import { closeAllTabs, sortTabsByDomain } from '@/app/features/tabs/tabsSlice'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'

const TabsMenu = () => {
	const tabs = useSelector((state: RootState) => state.tabs.tabs)
	const hasUnpinnedTabs = tabs.some((tab) => !tab.pinned)

	const handleCloseAllTabs = async () => {
		if (!hasUnpinnedTabs) return
		try {
			await closeAllTabs()
		} catch (error) {
			console.error('Failed to close all tabs:', error)
		}
	}

	const handleSortByDomain = async () => {
		if (!hasUnpinnedTabs) return
		try {
			await sortTabsByDomain()
		} catch (error) {
			console.error('Failed to sort tabs:', error)
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
							onAction={handleSortByDomain}
							className={`p-2 outline-none cursor-pointer
								${
									hasUnpinnedTabs
										? 'hover:bg-zinc-200'
										: 'opacity-50 cursor-not-allowed'
								}`}
							isDisabled={!hasUnpinnedTabs}
						>
							<div className="flex items-center gap-2">
								<FilePlus className="w-4 h-4" />
								Sort by domain
							</div>
						</MenuItem>
						<MenuItem
							className={`p-2 outline-none text-red-600 cursor-pointer
								${
									hasUnpinnedTabs
										? 'hover:bg-zinc-200'
										: 'opacity-50 cursor-not-allowed'
								}`}
							onAction={handleCloseAllTabs}
							isDisabled={!hasUnpinnedTabs}
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
