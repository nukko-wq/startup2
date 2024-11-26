import React from 'react'
import { Button, Form, Input, Label, TextField } from 'react-aria-components'
import { Controller } from 'react-hook-form'

const CreateWorkspaceForm = () => {
	return (
		<Form className="space-y-4">
			<Controller>
				<TextField autoFocus className="space-y-[2px]">
					<Label className="text-sm">Workspace Name</Label>
					<Input className="w-full px-3 py-2 border rounded focus:outline-blue-500" />
				</TextField>

				<div className="flex justify-end gap-2">
					<Button>キャンセル</Button>
					<Button>作成</Button>
				</div>
			</Controller>
		</Form>
	)
}

export default CreateWorkspaceForm
