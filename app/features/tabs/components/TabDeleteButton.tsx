import { X } from 'lucide-react'
import { useState } from 'react'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import { closeTab } from '@/app/features/tabs/tabsSlice'
import type { TabAction } from '@/app/features/tabs/types/tabs'

interface TabDeleteButtonProps extends TabAction {}

const TabDeleteButton = ({ tabId }: TabDeleteButtonProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const handlePress = async () => {
		if (tabId === undefined) return

		try {
			await closeTab(tabId)
		} catch (error) {
			console.error('Failed to close tab:', error)
		}
	}

	return (
		<TooltipTrigger
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			delay={700}
			closeDelay={0}
		>
			<Button
				onPress={handlePress}
				className="outline-none p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
				aria-label="タブを閉じる"
				isDisabled={tabId === undefined}
			>
				<X className="w-5 h-5 text-gray-700" />
			</Button>
			<Tooltip className="bg-gray-800 text-gray-300 text-sm shadow-md rounded-lg px-2 py-1">
				<OverlayArrow>
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
					<svg width={8} height={8} viewBox="0 0 8 8" className="fill-gray-800">
						<path d="M0 0 L4 4 L8 0" />
					</svg>
				</OverlayArrow>
				Close tab
			</Tooltip>
		</TooltipTrigger>
	)
}

export default TabDeleteButton
