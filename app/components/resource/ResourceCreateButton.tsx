import { FilePlus } from 'lucide-react'
import React, { useState } from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	OverlayArrow,
	Popover,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import ResourceCreateForm from './ResourceCreateForm'

const ResourceCreateButton = ({ sectionId }: { sectionId: string }) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div>
			<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
				<TooltipTrigger delay={700} closeDelay={0}>
					<Button
						aria-label="Menu"
						className="outline-none hover:bg-zinc-200 transition-colors duration-200 rounded-full p-2"
					>
						<FilePlus className="w-6 h-6 text-zinc-700" />
					</Button>
					<Tooltip className="bg-zinc-800 text-zinc-300 text-sm shadow-md rounded-lg px-2 py-1">
						<OverlayArrow>
							<svg
								width={8}
								height={8}
								viewBox="0 0 8 8"
								className="fill-zinc-800"
								aria-labelledby="arrowTitle"
							>
								<title id="arrowTitle">ツールチップの矢印</title>
								<path d="M0 0 L4 4 L8 0" />
							</svg>
						</OverlayArrow>
						Add Resource
					</Tooltip>
				</TooltipTrigger>
				<Popover placement="start" className="">
					<Dialog className="outline-none">
						<div className="bg-white flex items-center justify-center rounded-lg shadow-md">
							<ResourceCreateForm
								sectionId={sectionId}
								onClose={() => setIsOpen(false)}
							/>
						</div>
					</Dialog>
				</Popover>
			</DialogTrigger>
		</div>
	)
}

export default ResourceCreateButton
