import { GripVertical } from 'lucide-react'
import React, { useEffect } from 'react'
import { Button, GridList, GridListItem } from 'react-aria-components'
import ResourceIcon from '@/app/components/elements/ResourceIcon'
import ResourceDeleteButton from './ResourceDeleteButton'
import ResourceMenu from './ResourceMenu'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchResources } from '@/app/features/resource/resourceSlice'

interface ResourceListProps {
	sectionId: string
}

const ResourceList = ({ sectionId }: ResourceListProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const { resources, loading, error } = useSelector(
		(state: RootState) =>
			state.resource.resourcesBySection[sectionId] || {
				resources: [],
				loading: false,
				error: null,
			},
	)

	useEffect(() => {
		dispatch(fetchResources(sectionId))
	}, [dispatch, sectionId])

	if (loading) {
		return <div>読み込み中...</div>
	}

	if (error) {
		return <div>エラー: {error}</div>
	}

	return (
		<GridList
			aria-label="Resources in section"
			items={resources}
			className="flex flex-col border-slate-400 rounded-md min-h-[52px] outline-none bg-white shadow-sm"
			renderEmptyState={() => (
				<div className="flex flex-col justify-center items-center flex-grow">
					<div className="text-gray-500">Add resources here</div>
				</div>
			)}
		>
			{(resource) => (
				<GridListItem
					key={resource.id}
					data-resource={JSON.stringify(resource)}
					className="outline-none cursor-pointer"
				>
					<div className="grid grid-cols-[32px_1fr_74px] items-center p-1 border-b border-zinc-200 last:border-b-0 hover:bg-zinc-100 group">
						<div
							className="cursor-grab flex items-center opacity-0 group-hover:opacity-100 p-2"
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
						<div className="flex items-end gap-2 truncate">
							<ResourceIcon
								faviconUrl={resource.faviconUrl}
								mimeType={resource.mimeType}
								isGoogleDrive={resource.isGoogleDrive}
							/>
							<div className="flex flex-col truncate">
								<span className="truncate">{resource.title}</span>
								<span className="text-xs text-muted-foreground">
									{resource.description || 'Webpage'}
								</span>
							</div>
						</div>
						<div className="flex items-center opacity-0 group-hover:opacity-100">
							<ResourceMenu />
							<ResourceDeleteButton resourceId={resource.id} />
						</div>
					</div>
				</GridListItem>
			)}
		</GridList>
	)
}

export default ResourceList
