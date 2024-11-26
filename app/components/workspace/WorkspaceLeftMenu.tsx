import { Plus, SquarePlus } from 'lucide-react'
import React from 'react'
import {
	Button,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
} from 'react-aria-components'

const WorkspaceLeftMenu = () => {
	return (
		<>
			<MenuTrigger>
				<Button>
					<Plus className="w-5 h-5 text-zinc-50" />
				</Button>
				<Popover>
					<Menu>
						<MenuItem>
							<div className="flex items-center gap-3 text-sm">
								<SquarePlus className="w-4 h-4" />
								<span>New Space</span>
							</div>
						</MenuItem>
					</Menu>
				</Popover>
			</MenuTrigger>
		</>
	)
}

export default WorkspaceLeftMenu
