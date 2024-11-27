'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store/store'
import { fetchSections } from '@/app/features/section/sectionSlice'

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
		<div className="p-4 space-y-4">
			{sections.length === 0 ? (
				<div className="text-gray-500">セクションがありません</div>
			) : (
				sections.map((section) => (
					<div
						key={section.id}
						className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
					>
						<h3 className="text-lg font-medium text-gray-900">
							{section.name}
						</h3>
					</div>
				))
			)}
		</div>
	)
}

export default SectionList
