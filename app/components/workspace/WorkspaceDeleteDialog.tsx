import React from 'react'
import {
	Button,
	Dialog,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
} from 'react-aria-components'

const WorkspaceDeleteDialog = () => {
	return (
		<DialogTrigger>
			<Button className="hidden">Open Dialog</Button>
			<ModalOverlay className="fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur">
				<Modal className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
					<Dialog className="outline-none relative">
						{({ close }) => (
							<>
								<Heading className="text-xl font-semibold leading-6 my-0 text-slate-700">
									ワークスペースの削除
								</Heading>
								<p className="mt-3 text-slate-500">
									このワークスペースを削除してもよろしいですか？この操作は取り消せません。
								</p>
								<div className="mt-6 flex justify-end gap-2">
									<Button
										onPress={close}
										className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 outline-none"
										isDisabled={}
									>
										キャンセル
									</Button>
									<Button
										onPress={() => {}}
										className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 outline-none flex items-center gap-2"
										isDisabled={false}
									>
										削除
									</Button>
								</div>
							</>
						)}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	)
}

export default WorkspaceDeleteDialog
