"use client";
import useEditor from "@/hooks/useEditor";
import {
	SandpackProvider,
	SandpackCodeEditor,
	SandpackPreview,
} from "@codesandbox/sandpack-react";
import React from "react";

function Codesandbox({ SANDBOX_NUMBER }: { SANDBOX_NUMBER: number }) {
	const { editorView: jsonEditorView } = useEditor({
		code: "",
		editorParentId: `sandbox-${SANDBOX_NUMBER}`,
		language: "json",
	});
	return (
		<div className="w-full">
			<div className="" id={`sandbox-${SANDBOX_NUMBER}`}></div>
		</div>
	);
}

export default Codesandbox;
