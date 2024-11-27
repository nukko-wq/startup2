'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchSections } from '@/app/features/section/sectionSlice'
import { GridList, GridListItem } from 'react-aria-components'
import SectionItem from './SectionItem'

interface SectionListProps {
	spaceId: string | null
}

const SectionList = ({ spaceId }: SectionListProps) => {
	const dispatch = useDispatch<AppDispatch>()
	const { sections, loading, error } = useSelector(
		(state: RootState) =>
			state.section.sectionsBySpace[spaceId || ''] || {
				sections: [],
				loading: false,
				error: null,
			},
	)

	useEffect(() => {
		if (spaceId) {
			dispatch(fetchSections(spaceId))
		}
	}, [dispatch, spaceId])

	if (!spaceId) return <div>スペースが選択されていません</div>
	if (loading) return <div>読み込み中...</div>
	if (error) return <div>エラー: {error}</div>

	return (
		<GridList className="flex flex-col w-full gap-2">
			{sections.map((section) => (
				<GridListItem key={section.id} className="outline-none group">
					<SectionItem section={section} />
				</GridListItem>
			))}
		</GridList>
	)
}

export default SectionList
