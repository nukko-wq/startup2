'use client'

import { Diamond, GripVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button, GridList, GridListItem } from 'react-aria-components'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'
import { setTabs, sendMessageToExtension } from '@/app/features/tabs/tabsSlice'
import type { Tab } from '@/app/features/tabs/types'
import TabDeleteButton from './TabDeleteButton'
import TabSaveButton from './TabSaveButton'
import TabsMenu from './TabsMenu'

const TabList = () => {
	const dispatch = useDispatch()
	const tabs = useSelector((state: RootState) => state.tabs.tabs)
	const [isExtensionInstalled, setIsExtensionInstalled] = useState(true)

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
				const result = await sendMessageToExtension({
					type: 'REQUEST_TABS_UPDATE',
				})
				if (!result.success && result.error !== 'Extension not installed') {
					console.debug('Failed to request tabs:', result.error)
				}
			} catch (error: unknown) {
				if (
					error instanceof Error &&
					error.message !== 'Extension not installed'
				) {
					console.debug('Error requesting initial tabs:', error)
				}
			}
		}
		requestInitialTabs()

		return () => window.removeEventListener('message', handleMessage)
	}, [dispatch, isExtensionInstalled])

	const handleTabAction = async (tab: Tab) => {
		if (tab.id) {
			await sendMessageToExtension({
				type: 'SWITCH_TO_TAB',
				tabId: tab.id,
			})
		}
	}

	if (!isExtensionInstalled) {
		return (
			<div className="flex-grow py-5 pr-[16px] pl-[32px] max-w-[920px]">
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
			<GridList
				aria-label="Tabs"
				items={tabs}
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
		</div>
	)
}

export default TabList
