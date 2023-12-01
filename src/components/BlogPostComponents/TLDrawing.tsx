"use client";
import { memo, useContext, useRef, useState } from "react";

import { EditorContext } from "@/app/write/components/EditorContext";

import { cn } from "@/lib/utils";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Editor, Tldraw, useLocalStorageState } from "@tldraw/tldraw";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { Button } from "@components/ui/button";
import { tldrawEditorToSVG } from "@utils/processingTldrawings";
import { AiOutlineClose } from "react-icons/ai";

function TLDrawing({
	persistanceKey,
	caption,
	dark = true,
}: {
	persistanceKey: string;
	caption?: string;
	dark?: boolean;
}) {
	const { dispatch: EditorStateDispatch } = useContext(EditorContext);
	const [editor, setEditor] = useState<Editor>();
	const [preview, setPreview] = useState(false);
	const [zoom, setZoom] = useState(false);
	const [expand, setExpand] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const onPreview = async () => {
		if (preview) {
			setPreview(false);
			return;
		}
		if (!editor) return;
		const container = document.getElementById(
			`svgpreview-${persistanceKey}`
		);
		if (!container) return;
		const svg = await tldrawEditorToSVG(editor);
		if (!svg) return;

		svg.style.width = "100%";
		svg.setAttribute("id", `svg-${persistanceKey}`);
		svg.style.height = "100%";
		container.replaceChildren(svg);
		setPreview(true);
	};

	// const onExpand = async () => {
	// 	const svg = document.getElementById(`svg-${persistanceKey}`);
	// 	if (expand) {
	// 		if (svg) svg.style.width = "";
	// 		setExpand(false);
	// 		return;
	// 	}
	// 	if (svg) svg.style.width = "100%";
	// 	setExpand(true);
	// };

	return (
		<>
			<div className="flex flex-col relative" ref={containerRef}>
				<div className="flex gap-2 w-fit self-end">
					<Button
						className="text-sm bg-black py-1 px-2 mb-2  border-border border-[1px] text-gray-400 hover:text-white hover:scale-100"
						variant={"outline"}
						onClick={() => setExpand(true)}
					>
						Expand
					</Button>
					<Button
						className="text-sm bg-black py-1 px-2 mb-2  border-border border-[1px] text-gray-400 hover:text-white hover:scale-100"
						variant={"outline"}
						onClick={onPreview}
					>
						{preview ? "Back" : "Preview"}
					</Button>
				</div>
				<div
					className={cn(
						"w-full aspect-[4/3]",
						zoom
							? "fixed top-0 left-0 h-full p-10 [&>*]:cursor-zoom-out bg-black/80  overflow-auto z-[500]"
							: " [&>*]:cursor-zoom-in flex flex-col items-center absolute top-10 left-0",

						!preview && "hidden"
					)}
					onClick={() => setZoom((p) => !p)}
					id={`svgpreview-${persistanceKey}`}
				></div>
				<div
					className={cn(
						"relative w-full aspect-[4/3] self-center not-prose my-2",
						preview && "invisible"
					)}
				>
					<div className="tldraw__editor w-full h-full">
						<Tldraw
							persistenceKey={persistanceKey}
							onMount={(editor) => {
								EditorStateDispatch({
									type: "set canvas apps",
									payload: {
										[persistanceKey]: editor,
									},
								});
								editor.setDarkMode(dark);
								setEditor(editor);
							}}
							key={persistanceKey}
						/>
					</div>
				</div>

				<figcaption className="text-center italic text-gray-400">
					{caption}
				</figcaption>
			</div>

			{expand && (
				<div
					className="fixed top-0 left-0 w-screen flex items-center justify-center h-screen bg-black/75 z-[2000] cursor-zoom-out"
					onClick={() => setExpand(false)}
				>
					<div className={`w-full h-full px-10 py-5 relative`}>
						<div
							className="tldraw__editor w-full h-full"
							onClick={(e) => e.stopPropagation()}
						>
							<Tldraw persistenceKey={persistanceKey} />
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default memo(TLDrawing);
