"use client";
import useEditor from "@/hooks/useEditor";
import {
	SandpackProvider,
	SandpackCodeEditor,
	SandpackPreview,
} from "@codesandbox/sandpack-react";
import {
	CodeBlock,
	CodeBlockButton,
	CodeBlockButtons,
} from "@components/EditorComponents/GenericCodeBlock";
import React from "react";
import { SiVim } from "react-icons/si";

function Codesandbox({ SANDBOX_NUMBER }: { SANDBOX_NUMBER: number }) {
	const { editorView: jsonEditorView } = useEditor({
		code: "",
		editorParentId: `sandbox-${SANDBOX_NUMBER}`,
		language: "json",
	});
	return (
		<CodeBlock>
			<CodeBlockButtons>
				<CodeBlockButton tip="Enable Vim">
					<SiVim size={14} />
				</CodeBlockButton>
			</CodeBlockButtons>
			<div
				className="w-full border-[1px] border-white/50 rounded-sm"
				id={`sandbox-${SANDBOX_NUMBER}`}
			></div>
		</CodeBlock>
	);
}

export default Codesandbox;
