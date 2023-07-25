"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { EditorView } from "codemirror";
import React, { memo, useContext } from "react";
import { BiLink } from "react-icons/bi";

function HeadingButton({
	children,
	headingId,
	start,
}: {
	children: React.ReactNode;
	headingId: string;
	start?: number;
}) {
	const editorContext = useContext(EditorContext);
	return (
		<a
			href={`#${headingId}`}
			className="hover:underline underline-offset-2 flex gap-1 items-center h-fit"
			onClick={() => {
				navigator.clipboard.writeText(`#${headingId}`);
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
					});
				}
			}}
		>
			{children}
			<ToolTipComponent
				tip="Copy heading id"
				side="right"
				className="group-hover:visible invisible active:scale-90"
			>
				<BiLink size={18} />
			</ToolTipComponent>
		</a>
	);
}

export default memo(HeadingButton);
