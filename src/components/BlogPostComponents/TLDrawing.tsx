"use client";
import { useContext } from "react";

import { EditorContext } from "@/app/write/components/EditorContext";

import { Tldraw } from "@tldraw/tldraw";

function TLDrawing({ persistanceKey }: { persistanceKey: string }) {
	const { dispatch: EditorStateDispatch } = useContext(EditorContext);

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
			</div>
		</>
	);
}

export default TLDrawing;
