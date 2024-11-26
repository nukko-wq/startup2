import React from 'react'
import WorkspaceList from '@/app/components/workspace/WorkspaceList'

const Sidebar = () => {
	return (
		<div className="hidden md:flex flex-col min-h-screen bg-gray-800">
			<WorkspaceList />
		</div>
	)
}

export default Sidebar
