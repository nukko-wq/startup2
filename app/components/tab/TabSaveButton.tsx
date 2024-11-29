import { Bookmark } from 'lucide-react'
import React from 'react'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'

const TabSaveButton = () => {
	return (
		<TooltipTrigger
			isOpen={}
			onOpenChange={}
			delay={700}
			closeDelay={0}
		>
			<Button
				onPress={}
				className="outline-none p-2 hover:bg-gray-200 transition-colors duration-200 rounded-full"
			>
				<Bookmark className="w-5 h-5 text-gray-700" />
			</Button>
			<Tooltip className="bg-gray-800 text-gray-300 text-sm shadow-md rounded-lg px-2 py-1">
				<OverlayArrow>
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
					<svg width={8} height={8} viewBox="0 0 8 8" className="fill-gray-800">
						<path d="M0 0 L4 4 L8 0" />
					</svg>
				</OverlayArrow>
				Save to space
			</Tooltip>
		</TooltipTrigger>
	)
}

export default TabSaveButton
