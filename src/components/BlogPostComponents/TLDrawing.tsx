"use client";
import { memo, useContext, useEffect } from "react";

import { EditorContext } from "@/app/write/components/EditorContext";

import { Tldraw } from "@tldraw/tldraw";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { ExpandedCanvasContext } from "./ExpandedCanvas/ExpandedCanvasProvider";
import { Button } from "@components/ui/button";
import { cn } from "@/lib/utils";

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

	return (
		<>
			<div className="relative w-full aspect-[4/3] self-center not-prose my-4">
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
		</>
	);
}

export default memo(TLDrawing);
