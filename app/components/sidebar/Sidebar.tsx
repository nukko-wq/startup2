'use client'

import React from 'react'
import WorkspaceList from '@/app/components/workspace/WorkspaceList'
import { Link } from 'react-aria-components'

const Sidebar = () => {
	return (
		<div className="hidden md:flex flex-col min-h-screen bg-gray-800">
			<div className="flex items-center justify-between pl-4 pr-3 pt-4 pb-4">
				<Link
					href="/"
					className="text-zinc-50 text-2xl font-semibold outline-none"
				>
					Startup
				</Link>
			</div>
			<WorkspaceList />
		</div>
	)
}

export default Sidebar
