"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { EditorView } from "codemirror";
import { usePathname } from "next/navigation";
import React, { memo, useContext } from "react";
import { BiLink } from "react-icons/bi";
import { VscGoToFile } from "react-icons/vsc";

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
	const pathname = usePathname();
	return (
		<div
			className="hover:underline underline-offset-2  flex gap-1 items-center h-fit"
			// onClick={() => {
			// 	navigator.clipboard.writeText(`#${headingId}`);
			// 	if (editorContext && start) {
			// 		const { editorView, frontMatterLength } =
			// 			editorContext.editorState;
			// 		// const domElemAtPost = editorView?.domAtPos(frontMatterLength + start)
			// 		editorView?.dispatch({
			// 			effects: [
			// 				EditorView.scrollIntoView(
			// 					frontMatterLength + start,
			// 					{ y: "start" }
			// 				),
			// 			],
			// 		});
			// 	}
			// }}
		>
			{children}
			<ToolTipComponent
				tip="Copy heading id"
				side="bottom"
				className="group-hover:visible invisible active:scale-90"
			>
				<BiLink size={18} />
			</ToolTipComponent>
			{pathname?.startsWith("/write") && (
				<ToolTipComponent
					tip="jump to this section in editor"
					side="bottom"
					className="group-hover:visible invisible active:scale-90"
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
					<VscGoToFile size={18} />
				</ToolTipComponent>
			)}
		</div>
	);
}

export default memo(HeadingButton);
