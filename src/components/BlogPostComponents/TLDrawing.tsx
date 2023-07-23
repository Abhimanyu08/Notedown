"use client";
import { memo, useContext } from "react";

import { EditorContext } from "@/app/write/components/EditorContext";

import { Tldraw } from "@tldraw/tldraw";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { BsArrowsAngleExpand } from "react-icons/bs";
import { ExpandedCanvasContext } from "./ExpandedCanvas/ExpandedCanvasProvider";
import Button from "@components/ui/button";

function TLDrawing({ persistanceKey }: { persistanceKey: string }) {
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
						}}
					/>
				</div>
				<ToolTipComponent
					tip="Expand (E)"
					className="absolute top-2 left-2 z-[300]"
					onClick={() => {
						if (setPersistanceKey)
							setPersistanceKey(persistanceKey);
					}}
				>
					<Button className="p-2 rounded-full hover:bg-popover/80 text-black hover:text-white">
						<BsArrowsAngleExpand size={20} />
					</Button>
				</ToolTipComponent>
			</div>
		</>
	);
}

export default memo(TLDrawing);
