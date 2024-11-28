'use client'

import { Diamond, GripVertical } from 'lucide-react'
import { useEffect } from 'react'
import { Button, GridList, GridListItem } from 'react-aria-components'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'
import { setTabs } from '@/app/features/tabs/tabsSlice'
import TabDeleteButton from './TabDeleteButton'
import TabSaveButton from './TabSaveButton'
import TabsMenu from './TabsMenu'

const TabList = () => {
	const dispatch = useDispatch()
	const tabs = useSelector((state: RootState) => state.tabs.tabs)

	useEffect(() => {
		// 拡張機能からのメッセージを受け取る
		const handleMessage = (event: MessageEvent) => {
			if (
				event.data.source === 'startup-extension' &&
				event.data.type === 'TABS_UPDATED'
			) {
				dispatch(setTabs(event.data.tabs))
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [dispatch])

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
									<TabSaveButton />
								</div>
								<div className="opacity-0 group-hover:opacity-100">
									<TabDeleteButton />
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
