import useToggleVim from "@/hooks/useToggleVim";
import { cn } from "@/lib/utils";
import {
	CodeBlock,
	CodeBlockButtons,
	CodeBlockButton,
} from "@components/EditorComponents/GenericCodeBlock";
import { EditorView } from "codemirror";
import error from "next/error";
import React, { useState } from "react";
import { AiOutlineCodeSandbox } from "react-icons/ai";
import { SiVim } from "react-icons/si";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { motion } from "framer-motion";

function JsonConfigEditor({
	persistanceKey,
	jsonEditorView,
	onSandboxGenerate,
	className,
	error,
}: {
	persistanceKey: string;
	jsonEditorView: EditorView | null;
	onSandboxGenerate: () => void;
	className?: string;
	error?: string;
}) {
	const { toggleVim, vimEnabled } = useToggleVim({
		editorView: jsonEditorView,
	});
	const [minimize, setMinimize] = useState(false);

	return (
		<CodeBlock className={cn("w-full", className)}>
			<CodeBlockButtons>
				<CodeBlockButton
					tip={
						error
							? "Please remove the error"
							: "Generate code sandbox (shift + enter)"
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
				<CodeBlockButton
					onClick={() => setMinimize((p) => !p)}
					tip={minimize ? "maximize" : "minimize"}
				>
					{minimize ? (
						<FiMaximize2 size={14} />
					) : (
						<FiMinimize2 size={14} />
					)}
				</CodeBlockButton>
			</CodeBlockButtons>
			<div
				className={cn(
					"w-full border-2  border-border rounded-sm rounded-se-none",
					minimize && "h-10 overflow-hidden"
				)}
				id={`sandbox_${persistanceKey}`}
			></div>
			{error && (
				<span className="text-xs self-end text-black border-red-500 border-[1px] bg-[hsl(0,40%,70%)] font-semibold py-1 px-2 mt-2 w-fit rounded-md">
					Error: {error}
				</span>
			)}
		</CodeBlock>
	);
}

export default JsonConfigEditor;
