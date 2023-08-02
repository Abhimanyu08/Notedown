"use client";
import { StateEffect } from "@codemirror/state";
import { EditorContext } from "@/app/write/components/EditorContext";
import useEditor from "@/hooks/useEditor";
import { cn } from "@/lib/utils";
import { Button } from "@components/ui/button";
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
import { BlogContext } from "../BlogState";
import { useSupabase } from "@/app/appContext";
import { SUPABASE_FILES_BUCKET } from "@utils/constants";

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
	const { supabase, session } = useSupabase();
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState } = useContext(BlogContext);
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

	useEffect(() => {
		// if this config file exists in database download it and then put the config string in jsoneditor
		if (!jsonEditorView) return;
		if (blogState.uploadedFileNames?.includes(`${persistanceKey}.json`)) {
			const { blogger, id } = blogState.blogMeta;
			const fileName = `${session?.user?.id}/${id}/${persistanceKey}.json`;

			supabase.storage
				.from(SUPABASE_FILES_BUCKET)
				.download(fileName)
				.then((val) => {
					const { data } = val;
					if (data) {
						data.text().then((jsonString) => {
							jsonEditorView?.dispatch({
								changes: [
									{
										from: 0,
										to: jsonEditorView.state.doc.length,
										insert: jsonString,
									},
								],
							});
						});
					}
				});
		}
	}, [jsonEditorView, blogState.uploadedFileNames]);

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
					{sandpackProps && (
						<CustomSandpack
							{...sandpackProps}
							persistanceKey={persistanceKey}
						/>
					)}
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
