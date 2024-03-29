"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import useEditor from "@/hooks/useEditor";
import { cn } from "@/lib/utils";
import { StateEffect } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { Button } from "@components/ui/button";
import { EditorView } from "codemirror";
import { createContext, useContext, useEffect, useState } from "react";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import CustomSandpack from "./CustomSandpack";
import JsonConfigEditor from "./JsonConfigEditor";
import {
	SandpackConfigType,
	defaultSandpackProps,
	sandboxConfigSchema,
} from "./types";
import { AiOutlineCodeSandbox } from "react-icons/ai";

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
	const { dispatch } = useContext(EditorContext);
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
						className="text-sm bg-black py-1 px-2  self-end border-border border-[1px] mb-2 text-gray-400 hover:text-white hover:scale-100"
						variant={"outline"}
					>
						Edit Config
					</Button>
					<CustomSandpack
						{...(sandpackProps as any)}
						options={sandpackProps?.options || {}}
						template={sandpackProps?.template || "static"}
						persistanceKey={persistanceKey}
					/>
				</div>
				<div className="flex w-full justify-end">
					<Button
						className={cn(
							"text-sm bg-black py-1 px-2  border-border border-[1px] mb-2 text-gray-400 hover:text-white hover:scale-100",
							editConfig ? "" : "hidden"
						)}
						variant={"outline"}
						onClick={() => onSandboxGenerate()}
					>
						{/* <Button className="border-border border-[1px] text-gray-400 hover:text-white hover:scale-100"> */}

						<AiOutlineCodeSandbox />
						<span className="px-2">
							Generate sandbox (Shift-Enter)
						</span>
						{/* </Button> */}
					</Button>
				</div>
				<JsonConfigEditor
					className={`${editConfig ? "" : "hidden"}`}
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
