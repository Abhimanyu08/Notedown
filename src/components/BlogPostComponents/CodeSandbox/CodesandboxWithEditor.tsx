"use client";
import { StateEffect } from "@codemirror/state";
import { EditorContext } from "@/app/write/components/EditorContext";
import useEditor from "@/hooks/useEditor";
import { cn } from "@/lib/utils";
import Button from "@components/ui/button";
import { EditorView } from "codemirror";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import CustomSandpack from "./CustomSandpack";
import JsonConfigEditor from "./JsonConfigEditor";
import {
	SandpackConfigType,
	defaultSandpackProps,
	sandboxConfigSchema,
} from "./types";
import { keymap } from "@codemirror/view";
import useSyncHook from "@/hooks/useSyncHook";

export const JsonEditorContext = createContext<{
	jsonEditorView: EditorView | null;
	sandpackProps: SandpackConfigType | null;
}>({
	jsonEditorView: null,
	sandpackProps: null,
});

function CodesandboxWithEditor({
	persistanceKey,
}: // start,
// end,
{
	persistanceKey: string;
	// start: number;
	// end: number;
}) {
	const [editConfig, setEditConfig] = useState(true);
	const [error, setError] = useState("");
	// const markdownEditorContext = useContext(EditorContext);
	const { editorState, dispatch } = useContext(EditorContext);
	const [sandpackProps, setSandPackProps] = useState<SandpackConfigType>();

	const { editorView: jsonEditorView } = useEditor({
		code: JSON.stringify(defaultSandpackProps, null, 2),
		editorParentId: `sandbox_${persistanceKey}`,
		language: "json",
	});

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
	// useEffect(() => {
	// 	if (!jsonEditorView) return;
	// 	if (
	// 		initialConfig.trim().replace(/\n/g, "") !==
	// 		jsonEditorView?.state.sliceDoc().trim().replace(/\n/g, "")
	// 	) {
	// 		setEditConfig(true);
	// 		setError("Please update json using the above editor");
	// 	} else {
	// 		setError("");
	// 	}
	// }, [initialConfig, jsonEditorView]);

	// useSyncHook({
	// 	editorView: jsonEditorView,
	// 	startOffset: start + 11,
	// 	endOffset: end - 3,
	// 	sandbox: true,
	// });

	const onSandboxGenerate = () => {
		const configJsonString = jsonEditorView?.state.sliceDoc();
		if (!configJsonString) return;

		try {
			const configObject = JSON.parse(configJsonString);
			sandboxConfigSchema.parse(configObject);

			setSandPackProps(configObject);
			setEditConfig(false);
			setError("");
		} catch (e) {
			try {
				setError(fromZodError(e as ZodError).toString());
			} catch (_) {
				setError((e as Error).message);
			}
		}
	};

	return (
		<JsonEditorContext.Provider
			value={{ jsonEditorView, sandpackProps: sandpackProps || null }}
		>
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
				<JsonConfigEditor
					className={`${!editConfig ? "hidden" : ""}`}
					{...{
						persistanceKey,
						jsonEditorView,
						onSandboxGenerate,
						error,
					}}
				/>
			</div>
		</JsonEditorContext.Provider>
	);
}

export default CodesandboxWithEditor;
