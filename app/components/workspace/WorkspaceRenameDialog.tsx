import React from 'react'
import {
	Dialog,
	DialogTrigger,
	Modal,
	ModalOverlay,
} from 'react-aria-components'
import WorkspaceRenameForm from '@/app/components/workspace/WorkspaceRenameForm'

interface WorkspaceRenameDialogProps {
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
	workspaceId: string
	currentName: string
}

const WorkspaceRenameDialog = ({
	isOpen,
	onOpenChange,
	workspaceId,
	currentName,
}: WorkspaceRenameDialogProps) => {
	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-none relative">
						{({ close }) => (
							<WorkspaceRenameForm
								workspaceId={workspaceId}
								currentName={currentName}
								onClose={close}
							/>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default WorkspaceRenameDialog
