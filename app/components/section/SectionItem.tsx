import React from 'react'
import { File } from 'lucide-react'
import SectionNameEdit from './SectionNameEdit'
import ResourceCreateButton from '../resource/ResourceCreateButton'
import SectionMenu from './SectionMenu'
import ResourceList from '../resource/ResourceList'

const SectionItem = () => {
	return (
		<div className="min-w-[260px] max-w-[920px] w-full pl-[16px] pr-[32px] py-5 outline-none">
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center ml-4 cursor-grab" slot="drag">
					<File className="w-6 h-6 text-zinc-700" />
					<SectionNameEdit />
				</div>
				<div className="hidden md:flex">
					<ResourceCreateButton />
					<SectionMenu />
				</div>
			</div>
			<ResourceList />
		</div>
	)
}

export default SectionItem
