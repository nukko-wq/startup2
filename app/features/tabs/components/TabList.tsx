'use client'

import { Diamond, GripVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	Button,
	GridList,
	GridListItem,
	useDragAndDrop,
} from 'react-aria-components'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'
import { setTabs, sendMessageToExtension } from '@/app/features/tabs/tabsSlice'
import type { Tab } from '@/app/features/tabs/types/tabs'
import TabDeleteButton from '@/app/features/tabs/components/TabDeleteButton'
import TabSaveButton from '@/app/features/tabs/components/TabSaveButton'
import TabsMenu from '@/app/features/tabs/components/TabsMenu'

const TabList = () => {
	const dispatch = useDispatch()
	const tabs = useSelector((state: RootState) => state.tabs.tabs)
	const [isExtensionInstalled, setIsExtensionInstalled] = useState(true)
	const [retryCount, setRetryCount] = useState(0)
	const MAX_RETRIES = 3

	useEffect(() => {
		setIsExtensionInstalled(!!window.chrome?.runtime)
	}, [])

	useEffect(() => {
		if (!isExtensionInstalled) return

		const handleMessage = (event: MessageEvent) => {
			if (
				event.data.source === 'startup-extension' &&
				event.data.type === 'TABS_UPDATED'
			) {
				console.log('Received tabs update:', event.data.tabs)
				dispatch(setTabs(event.data.tabs))
			}
		}

		window.addEventListener('message', handleMessage)

		const requestInitialTabs = async () => {
			try {
				if (!isExtensionInstalled) return

				await new Promise((resolve) => setTimeout(resolve, 1000))

				const result = await sendMessageToExtension({
					type: 'REQUEST_TABS_UPDATE',
				})

				if (!result.success) {
					if (retryCount < MAX_RETRIES) {
						console.debug(
							`Retrying tab request (${retryCount + 1}/${MAX_RETRIES})`,
						)
						setRetryCount((prev) => prev + 1)
						setTimeout(requestInitialTabs, 2000)
					} else if (result.error !== 'Extension not installed') {
						console.debug('Failed to request tabs after retries:', result.error)
					}
				} else {
					setRetryCount(0)
				}
			} catch (error: unknown) {
				if (
					error instanceof Error &&
					error.message !== 'Extension not installed' &&
					retryCount < MAX_RETRIES
				) {
					console.debug(
						`Error requesting tabs (retry ${retryCount + 1}/${MAX_RETRIES}):`,
						error,
					)
					setRetryCount((prev) => prev + 1)
					setTimeout(requestInitialTabs, 2000)
				}
			}
		}

		requestInitialTabs()

		return () => window.removeEventListener('message', handleMessage)
	}, [dispatch, isExtensionInstalled, retryCount])

	const handleTabAction = async (tab: Tab) => {
		try {
			if (tab.id) {
				const result = await sendMessageToExtension({
					type: 'SWITCH_TO_TAB',
					tabId: tab.id,
				})
				if (!result.success) {
					console.debug('Failed to switch tab:', result.error)
				}
			}
		} catch (error) {
			console.debug('Error switching tab:', error)
		}
	}

	const { dragAndDropHooks } = useDragAndDrop({
		getItems(keys) {
			const tab = tabs.find((t) => t.id === Array.from(keys)[0])
			if (!tab) return []
			return [
				{
					'tab-item': JSON.stringify(tab),
					'text/plain': tab.title,
				},
			]
		},
	})

	if (!isExtensionInstalled) {
		return (
			<div className="flex-grow py-5 pr-[16px] pl-[32px] max-w-[920px] overflow-y-auto">
				<div className="flex items-center justify-between gap-2 ml-4 mb-2">
					<div className="flex items-center gap-2">
						<Diamond className="w-6 h-6" />
						<div className="text-[17px] text-zinc-700">Tabs</div>
					</div>
				</div>
				<div className="flex items-center pl-4">
					<p>
						Chrome拡張機能がインストールされていると、開いているタブを表示できます。
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex-grow py-5 pr-[16px] pl-[32px] max-w-[920px]">
			<div className="flex items-center justify-between gap-2 ml-4 mb-2">
				<div className="flex items-center gap-2">
					<Diamond className="w-6 h-6" />
					<div className="text-[17px] text-zinc-700">Tabs</div>
				</div>
				<TabsMenu />
			</div>
			{tabs.length > 0 && (
				<GridList
					aria-label="Tabs"
					items={tabs}
					dragAndDropHooks={dragAndDropHooks}
					className="border-slate-400 rounded-md flex flex-col bg-white shadow-sm"
				>
					{(tab) => (
						<GridListItem
							key={tab.id}
							className="block items-center gap-2 pr-2 py-1 truncate hover:bg-zinc-100 rounded cursor-grab group outline-none"
							onAction={() => handleTabAction(tab)}
						>
							<div className="grid grid-cols-[1fr_72px] items-center gap-2">
								<div className="flex items-center gap-2 truncate">
									<div
										className="cursor-grab flex items-center opacity-0 group-hover:opacity-100 pl-3"
										aria-label="Drag Wrapper"
									>
										<Button
											className="cursor-grab"
											slot="drag"
											aria-label="ドラッグハンドル"
										>
											<GripVertical className="w-4 h-4 text-zinc-500" />
										</Button>
									</div>
									<div className="flex items-center gap-2 truncate">
										{tab.faviconUrl ? (
											<img
												src={tab.faviconUrl}
												alt=""
												className="w-4 h-4 flex-grow"
											/>
										) : (
											<div className="w-4 h-4 bg-gray-200 rounded-full" />
										)}
										<span className="truncate">{tab.title}</span>
									</div>
								</div>
								<div className="flex items-center">
									<div className="opacity-0 group-hover:opacity-100">
										<TabSaveButton
											tabId={tab.id}
											title={tab.title}
											url={tab.url}
											faviconUrl={tab.faviconUrl}
										/>
									</div>
									<div className="opacity-0 group-hover:opacity-100">
										<TabDeleteButton tabId={tab.id} />
									</div>
								</div>
							</div>
						</GridListItem>
					)}
				</GridList>
			)}
			{tabs.length === 0 && (
				<div className="border-slate-400 rounded-md flex flex-col bg-white shadow-sm h-[56px] justify-center items-center">
					<p className="text-zinc-400 text-sm">Start browsing</p>
				</div>
			)}
		</div>
	)
}

export default TabList
