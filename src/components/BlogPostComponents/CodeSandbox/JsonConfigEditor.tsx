import { EditorContext } from "@/app/write/components/EditorContext";
import useRecoverSandpack from "@/hooks/useRecoverSandpackConfig";
import useToggleVim from "@/hooks/useToggleVim";
import { cn } from "@/lib/utils";
import { StateEffect } from "@codemirror/state";
import { ViewPlugin, ViewUpdate, keymap } from "@codemirror/view";
import { IndexedDbContext } from "@components/Contexts/IndexedDbContext";
import {
	CodeBlock,
	CodeBlockButton,
	CodeBlockButtons,
} from "@components/EditorComponents/GenericCodeBlock";
import { EditorView } from "codemirror";
import { useContext, useEffect, useState } from "react";
import { AiOutlineCodeSandbox } from "react-icons/ai";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { SiVim } from "react-icons/si";

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
	const [minimize, setMinimize] = useState(false);

	const { editorState, dispatch } = useContext(EditorContext);
	const { documentDb } = useContext(IndexedDbContext);

	const { toggleVim, vimEnabled } = useToggleVim({
		editorView: jsonEditorView,
	});

	const jsonConfigString = useRecoverSandpack({ persistanceKey });
	useEffect(() => {
		if (!jsonEditorView) return;
		jsonEditorView?.dispatch({
			changes: [
				{
					from: 0,
					to: jsonEditorView.state.doc.length,
					insert: jsonConfigString,
				},
			],
		});
	}, [jsonConfigString, jsonEditorView]);

	useEffect(() => {
		if (!jsonEditorView) return;
		jsonEditorView.dispatch({
			effects: StateEffect.appendConfig.of([
				keymap.of([
					{
						key: "Shift-Enter",
						run() {
							onSandboxGenerate();
							return true;
						},
					},
				]),
			]),
		});
		dispatch({
			type: "set sandbox editor",
			payload: { [persistanceKey]: jsonEditorView },
		});

		return () => {
			dispatch({
				type: "remove sandbox editor",
				payload: persistanceKey,
			});
		};
	}, [jsonEditorView]);

	useEffect(() => {
		if (!jsonEditorView || !documentDb) return;
		const stateUpdatePlugin = ViewPlugin.fromClass(
			class {
				update(update: ViewUpdate) {
					if (update.docChanged) {
						const configString = update.state.sliceDoc();

						let objectStore = documentDb!
							.transaction("sandpackConfigs", "readwrite")
							.objectStore("sandpackConfigs");
						const newData = {
							timeStamp: persistanceKey,
							config: configString,
						};
						objectStore.put(newData);
					}

					// localStorage.setItem(localStorageDraftKey, markdown);
					// if (!update.view.hasFocus) return;
				}
			}
		);
		jsonEditorView.dispatch({
			effects: StateEffect.appendConfig.of(stateUpdatePlugin.extension),
		});
	}, [jsonEditorView, documentDb]);

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
