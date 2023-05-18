import ToolbarButton from "@/app/apppost/components/ToolbarButton";
import { useContext } from "react";
import { AiFillEdit } from "react-icons/ai";
import { VscPreview } from "react-icons/vsc";
import { EditorContext } from "./EditorContext";

function EditorToolbar() {
	const { editorState, dispatch } = useContext(EditorContext);

	return (
		<>
			<ToolbarButton
				className=""
				tip={
					editorState.editingMarkdown
						? "Preview (Alt+P)"
						: "Edit Markdown (Alt+P)"
				}
				onClick={() => {
					if (!editorState.editorView) return;
					dispatch({ type: "toggle markdown editor", payload: null });
				}}
			>
				{editorState.editingMarkdown ? (
					<VscPreview
						size={28}
						className="text-black dark:text-white mt-2 ml-2"
					/>
				) : (
					<AiFillEdit
						size={28}
						className="text-black dark:text-white mt-2 ml-2"
					/>
				)}
			</ToolbarButton>
		</>
	);
}

export default EditorToolbar;
