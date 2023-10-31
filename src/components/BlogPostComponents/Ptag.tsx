"use client";
import { EditorView } from "codemirror";
import { EditorContext } from "@/app/write/components/EditorContext";
import {
	HtmlAstElement,
	defaultTagToJsx,
	getStartEndFromNode,
	transformer,
} from "@utils/html2Jsx/transformer";
import { usePathname } from "next/navigation";
import React, { useContext } from "react";

function Ptag({ element }: { element: HtmlAstElement }) {
	const pathname = usePathname();
	const editorContext = useContext(EditorContext);

	if (pathname !== "/write") {
		return defaultTagToJsx(element);
	}

	const { start } = getStartEndFromNode(element);
	return (
		<p
			onClick={() => {
				if (editorContext && start) {
					const { editorView, frontMatterLength } =
						editorContext.editorState;
					// const domElemAtPost = editorView?.domAtPos(frontMatterLength + start)
					editorView?.dispatch({
						effects: [
							EditorView.scrollIntoView(
								frontMatterLength + start,
								{ y: "start" }
							),
						],
						selection: { anchor: start },
					});
				}
			}}
		>
			{element.children.map((child) => transformer(child))}
		</p>
	);
}

export default Ptag;
