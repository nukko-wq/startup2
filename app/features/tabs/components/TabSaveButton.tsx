import { Bookmark } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
	Button,
	OverlayArrow,
	Tooltip,
	TooltipTrigger,
} from 'react-aria-components'
import { createResource } from '@/app/features/resource/resourceSlice'
import type { TabAction } from '@/app/features/tabs/types/tabs'
import type { AppDispatch, RootState } from '@/app/store/store'
import {
	addResourceOptimistically,
	removeResourceOptimistically,
} from '@/app/features/resource/resourceSlice'
import { v4 as uuidv4 } from 'uuid'

interface TabSaveButtonProps extends TabAction {
	title: string
	url: string
	faviconUrl?: string
}

const TabSaveButton = ({
	tabId,
	title,
	url,
	faviconUrl,
}: TabSaveButtonProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const dispatch = useDispatch<AppDispatch>()

	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)

	const firstSection = useSelector((state: RootState) => {
		if (!activeSpaceId) return null
		const spaceState = state.section.sectionsBySpace[activeSpaceId]
		if (!spaceState?.sections.length) return null
		return spaceState.sections.slice().sort((a, b) => a.order - b.order)[0]
	})

	const handlePress = async () => {
		if (!title || !url || !firstSection) {
			console.error('Required fields are missing')
			return
		}

		// 楽観的更新用の一時的なリソースを作成
		const optimisticResource = {
			id: uuidv4(),
			title,
			url,
			sectionId: firstSection.id,
			faviconUrl,
			order: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		try {
			// 楽観的に更新
			dispatch(
				addResourceOptimistically({
					sectionId: firstSection.id,
					resource: optimisticResource,
				}),
			)

			// 実際のリソース作成
			await dispatch(
				createResource({
					title,
					url,
					sectionId: firstSection.id,
					faviconUrl,
					optimisticId: optimisticResource.id,
				}),
			).unwrap()
		} catch (error) {
			// エラーの場合は楽観的に追加したリソースを削除
			dispatch(
				removeResourceOptimistically({
					sectionId: firstSection.id,
					resourceId: optimisticResource.id,
				}),
			)
			console.error('Failed to save tab:', error)
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
				className="outline-none p-2 hover:bg-gray-200 transition-colors duration-200 rounded-full"
				aria-label="タブを保存"
				isDisabled={!firstSection}
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
				{firstSection ? 'Save to space' : 'Select a space first'}
			</Tooltip>
		</TooltipTrigger>
	)
}

export default TabSaveButton
