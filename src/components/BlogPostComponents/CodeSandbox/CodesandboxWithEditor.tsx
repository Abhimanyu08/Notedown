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
import { SandpackConfigType, sandboxConfigSchema } from "./types";
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
	SANDBOX_NUMBER,
	initialConfig,
	start,
	end,
}: {
	SANDBOX_NUMBER: number;
	initialConfig?: string;
	start: number;
	end: number;
}) {
	const defaultSandboxProps: SandpackConfigType = initialConfig
		? JSON.parse(initialConfig)
		: {
				template: "static",
				options: {
					editorHeight: 500,
					showConsole: true,
				},
				theme: "dark",
		  };
	const [editConfig, setEditConfig] = useState(true);
	const [error, setError] = useState("");
	const markdownEditorContext = useContext(EditorContext);
	const [sandpackProps, setSandPackProps] =
		useState<SandpackConfigType>(defaultSandboxProps);

	const { editorView: jsonEditorView } = useEditor({
		code: JSON.stringify(sandpackProps || defaultSandboxProps, null, 2),
		editorParentId: `sandbox-${SANDBOX_NUMBER}`,
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
	}, [jsonEditorView]);

	const syncFunction = useSyncHook({
		editorView: jsonEditorView,
		startOffset: start + 11,
		endOffset: end - 3,
		id: `SANDBOX_${SANDBOX_NUMBER}`,
	});

	const onSandboxGenerate = () => {
		if (!markdownEditorContext) return;
		const configJsonString = jsonEditorView?.state.sliceDoc();
		if (!configJsonString) return;

		try {
			const configObject = JSON.parse(configJsonString);
			sandboxConfigSchema.parse(configObject);

			setSandPackProps(configObject);
			setEditConfig(false);

			syncFunction();
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
				<JsonConfigEditor
					className={`${!editConfig ? "hidden" : ""}`}
					{...{
						SANDBOX_NUMBER,
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
