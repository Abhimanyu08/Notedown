import React, { useState } from "react";
import { EditorView } from "codemirror";
import { onCanvas, onCodeBlock } from "../../../utils/editorToolFunctions";

interface ShortcutComponentProps {
	editorView: EditorView;
}

function ShortcutComponent({ editorView }: ShortcutComponentProps) {
	const [showMenu, setShowMenu] = useState(false);

	return (
		<>
			<p
				contentEditable
				className="focus:outline-none outline-none"
				tabIndex={0}
				data-placeholder="Press / for options"
				id="trigger"
				onKeyDown={(e) => {
					if (e.currentTarget.textContent === "" && e.key === "/") {
						setShowMenu(true);
					}
					if (showMenu && e.currentTarget.textContent !== "") {
						setShowMenu(false);
					}
				}}
			></p>
			{showMenu && (
				<div className="flex flex-col not-prose rounded-md bg-black text-white w-fit p-4">
					<button onClick={() => onCodeBlock(editorView)}>
						block
					</button>
					<button onClick={() => onCanvas(editorView)}>canvas</button>
					<button>image</button>
					<button>carousel</button>
				</div>
			)}
		</>
	);
}

export default ShortcutComponent;
