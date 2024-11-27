'use client'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store/store'
import SectionList from './SectionList'

const SectionListWrapper = () => {
	const activeSpaceId = useSelector(
		(state: RootState) => state.space.activeSpaceId,
	)

	if (!activeSpaceId) {
		return <div>No active space</div>
	}

	return <SectionList spaceId={activeSpaceId} />
}

export default SectionListWrapper
