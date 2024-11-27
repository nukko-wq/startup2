import Sidebar from '@/app/components/sidebar/Sidebar'
import SectionListWrapper from '@/app/components/section/SectionListWrapper'

export default function Home() {
	return (
		<div className="flex w-full h-full">
			<main className="flex flex-col w-full h-full">
				<div className="grid grid-cols-[260px_1fr] min-[1921px]:grid-cols-[320px_1fr] bg-slate-50">
					<Sidebar />
					<SectionListWrapper />
				</div>
			</main>
		</div>
	)
}
