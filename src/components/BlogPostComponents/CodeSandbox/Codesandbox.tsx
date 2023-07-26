"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import useEditor from "@/hooks/useEditor";
import useToggleVim from "@/hooks/useToggleVim";
import { cn } from "@/lib/utils";
import {
	CodeBlock,
	CodeBlockButton,
	CodeBlockButtons,
} from "@components/EditorComponents/GenericCodeBlock";
import Button from "@components/ui/button";
import { EditorView } from "codemirror";
import { createContext, useContext, useState } from "react";
import { AiOutlineCodeSandbox } from "react-icons/ai";
import { SiVim } from "react-icons/si";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import CustomSandpack from "./CustomSandpack";
import { SandpackConfigType, sandboxConfigSchema } from "./types";

const defaultSandboxProps: SandpackConfigType = {
	template: "static",
	options: {
		editorHeight: 500,
	},
	theme: "dark",
};

export const JsonEditorContext = createContext<{
	jsonEditorView: EditorView | null;
	sandpackProps: SandpackConfigType | null;
}>({
	jsonEditorView: null,
	sandpackProps: null,
});

function Codesandbox({
	SANDBOX_NUMBER,
	start,
	end,
}: {
	SANDBOX_NUMBER: number;
	initialConfig?: string;
	start?: number;
	end?: number;
}) {
	const [editConfig, setEditConfig] = useState(true);
	const [error, setError] = useState("");
	const editorStateContext = useContext(EditorContext);
	const [sandpackProps, setSandPackProps] =
		useState<SandpackConfigType>(defaultSandboxProps);

	const { editorView: jsonEditorView } = useEditor({
		code: JSON.stringify(sandpackProps || defaultSandboxProps, null, 2),
		editorParentId: `sandbox-${SANDBOX_NUMBER}`,
		language: "json",
	});
	const { toggleVim, vimEnabled } = useToggleVim({
		editorView: jsonEditorView,
	});

	const onSandboxGenerate = () => {
		if (!editorStateContext) return;
		const configJsonString = jsonEditorView?.state.sliceDoc();
		if (!configJsonString) return;

		try {
			const configObject = JSON.parse(configJsonString);
			sandboxConfigSchema.parse(configObject);

			setSandPackProps(configObject);
			setEditConfig(false);
			const { editorState } = editorStateContext;
			const { editorView, frontMatterLength } = editorState;

			if (start && end) {
				editorView?.dispatch({
					changes: [
						{
							from:
								start +
								frontMatterLength +
								4 +
								"sandbox".length,
							to: end + frontMatterLength - 3,
							insert: configJsonString + "\n",
						},
					],
				});
			}
		} catch (e) {
			try {
				setError(fromZodError(e as ZodError).toString());
			} catch (_) {
				setError((e as Error).message);
			}
		}
	};

	return (
		<JsonEditorContext.Provider value={{ jsonEditorView, sandpackProps }}>
			<div className="w-full">
				<div
					className={cn(
						"flex flex-col w-full ",
						editConfig && "hidden"
					)}
				>
					<Button
						onClick={() => setEditConfig(true)}
						className="text-sm self-end border-border border-[1px] mb-2 text-gray-400 hover:text-white hover:scale-100"
					>
						Edit Config
					</Button>
					{sandpackProps && <CustomSandpack {...sandpackProps} />}
				</div>
				<CodeBlock className={cn("w-full", !editConfig && "hidden")}>
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
								className={`${
									vimEnabled ? "text-lime-400" : ""
								}`}
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
			</div>
		</JsonEditorContext.Provider>
	);
}

export default Codesandbox;
