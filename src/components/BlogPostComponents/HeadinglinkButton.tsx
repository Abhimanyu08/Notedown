"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { EditorView } from "codemirror";
import { usePathname } from "next/navigation";
import path from "path";
import React, { memo, useContext, useState } from "react";
import { BiCheck, BiLink } from "react-icons/bi";
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
	const [copied, setCopied] = useState(false);
	return (
		<div className="hover:underline underline-offset-2  flex gap-2 items-center h-fit">
			{children}
			<ToolTipComponent
				tip="Copy heading id"
				side="bottom"
				className="group-hover:visible invisible active:scale-90"
				onClick={() => {
					setCopied(true);
					let p: Promise<any>;
					if (pathname?.startsWith("/write")) {
						p = navigator.clipboard.writeText(`#${headingId}`);
					} else {
						p = navigator.clipboard.writeText(
							`${window.location.href}#${headingId}`
						);
					}
					p.then(() => {
						setTimeout(() => setCopied(false), 2000);
					});
				}}
			>
				{copied ? <BiCheck size={18} /> : <BiLink size={18} />}
			</ToolTipComponent>
			{pathname?.startsWith("/write") && (
				<ToolTipComponent
					tip="jump to this section in editor"
					side="bottom"
					className="group-hover:visible invisible active:scale-90"
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
