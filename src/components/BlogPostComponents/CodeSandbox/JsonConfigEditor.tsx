import useToggleVim from "@/hooks/useToggleVim";
import { cn } from "@/lib/utils";
import {
	CodeBlock,
	CodeBlockButtons,
	CodeBlockButton,
} from "@components/EditorComponents/GenericCodeBlock";
import { EditorView } from "codemirror";
import error from "next/error";
import React from "react";
import { AiOutlineCodeSandbox } from "react-icons/ai";
import { SiVim } from "react-icons/si";

function JsonConfigEditor({
	SANDBOX_NUMBER,
	jsonEditorView,
	onSandboxGenerate,
	className,
	error,
}: {
	SANDBOX_NUMBER: number;
	jsonEditorView: EditorView | null;
	onSandboxGenerate: () => void;
	className?: string;
	error?: string;
}) {
	const { toggleVim, vimEnabled } = useToggleVim({
		editorView: jsonEditorView,
	});

	return (
		<CodeBlock className={cn("w-full", className)}>
			<CodeBlockButtons>
				<CodeBlockButton
					tip={
						error
							? "Please remove the error"
							: "Generate code sandbox"
					}
					onClick={() => onSandboxGenerate()}
				>
					<AiOutlineCodeSandbox />
				</CodeBlockButton>
				<CodeBlockButton
					onClick={() => toggleVim()}
					tip={vimEnabled ? "Disable Vim" : "Enable Vim"}
				>
					<SiVim
						size={14}
						className={`${vimEnabled ? "text-lime-400" : ""}`}
					/>
				</CodeBlockButton>
			</CodeBlockButtons>
			<div
				className="w-full border-[1px] border-white/50 rounded-sm"
				id={`sandbox-${SANDBOX_NUMBER}`}
			></div>
			{error && (
				<span className="text-xs self-end border-red-500 border-[1px] bg-[hsl(0,40%,70%)] font-semibold py-1 px-2 mt-2 w-fit rounded-md">
					Error: {error}
				</span>
			)}
		</CodeBlock>
	);
}

export default JsonConfigEditor;
