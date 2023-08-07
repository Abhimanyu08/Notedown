"use client";
import { memo, useContext, useState } from "react";

import { EditorContext } from "@/app/write/components/EditorContext";

import { cn } from "@/lib/utils";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Editor, Tldraw, useLocalStorageState } from "@tldraw/tldraw";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { ExpandedCanvasContext } from "./ExpandedCanvas/ExpandedCanvasProvider";
import { Button } from "@components/ui/button";
import { tldrawEditorToSVG } from "@utils/processingTldrawings";

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
	const { setPersistanceKey } = useContext(ExpandedCanvasContext);
	const [editor, setEditor] = useState<Editor>();
	const [preview, setPreview] = useState(false);
	const [expand, setExpand] = useState(false);

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
		svg.style.height = "100%";

		container.replaceChildren(svg);
		setPreview(true);
	};

	return (
		<div className="flex flex-col">
			<Button
				className="text-sm bg-black py-1 px-2 mb-2  self-end border-border border-[1px] text-gray-400 hover:text-white hover:scale-100"
				variant={"outline"}
				onClick={onPreview}
			>
				{preview ? "Back" : "Preview"}
			</Button>
			<div
				className={cn(
					"w-full",
					!preview && "hidden",
					expand
						? "fixed top-0 left-0 h-full p-10 [&>*]:cursor-zoom-out bg-black/80  overflow-auto z-[600]"
						: " [&>*]:cursor-zoom-in"
				)}
				onClick={() => setExpand((p) => !p)}
				id={`svgpreview-${persistanceKey}`}
			></div>
			<div
				className={cn(
					"relative w-full aspect-[4/3] self-center not-prose my-2",
					preview && "hidden"
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
				<ToolTipComponent
					tip="Expand"
					className={cn(
						"absolute top-2 left-2 z-[300]",
						"p-2 rounded-full  hover:white",
						dark
							? "hover:bg-white text-white hover:text-black"
							: "hover:bg-black text-black hover:text-white "
					)}
					onClick={() => {
						if (setPersistanceKey)
							setPersistanceKey(persistanceKey);
					}}
				>
					<BsArrowsAngleExpand size={20} />
				</ToolTipComponent>
			</div>

			<figcaption className="text-center italic text-gray-400">
				{caption}
			</figcaption>
		</div>
	);
}

export default memo(TLDrawing);
