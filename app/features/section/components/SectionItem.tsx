import { File } from 'lucide-react'
import SectionNameEdit from '@/app/features/section/components/SectionNameEdit'
import ResourceCreateButton from '@/app/features/resource/components/ResourceCreateButton'
import SectionMenu from '@/app/features/section/components/SectionMenu'
import ResourceList from '@/app/features/resource/components/ResourceList'
import type { Section } from '@/app/features/section/types/section'
import { useSectionResources } from '@/app/features/section/hooks/useSectionResources'

interface SectionItemProps {
	section: Section
}

const SectionItem = ({ section }: SectionItemProps) => {
	const { resources, loading, error } = useSectionResources(section.id)

	if (loading) {
		return <div>読み込み中...</div>
	}

	if (error) {
		return <div>エラーが発生しました: {error}</div>
	}

	return (
		<div className="min-w-[260px] max-w-[920px] w-full pl-[16px] pr-[32px] py-5 outline-none">
			<div className="flex justify-between items-center mb-2">
				<div className="flex items-center ml-4 cursor-grab" slot="drag">
					<File className="w-6 h-6 text-zinc-700" />
					<SectionNameEdit section={section} />
				</div>
				<div className="hidden md:flex">
					<ResourceCreateButton sectionId={section.id} />
					<SectionMenu sectionId={section.id} />
				</div>
			</div>
			<ResourceList resources={resources} sectionId={section.id} />
		</div>
	)
}

export default SectionItem
