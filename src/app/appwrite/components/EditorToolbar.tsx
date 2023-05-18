import ToolbarButton from "@/app/apppost/components/ToolbarButton";
import { useContext } from "react";
import { AiFillEdit } from "react-icons/ai";
import { VscPreview } from "react-icons/vsc";
import { EditorContext } from "./EditorContext";
import prepareContainer from "@/app/utils/prepareContainer";
import { BiCodeAlt } from "react-icons/bi";

function EditorToolbar() {
	const { editorState, dispatch } = useContext(EditorContext);
	const { language } = editorState.blogMeta;

	return (
		<>
			{language && (
				<ToolbarButton
					className=""
					tip={` ${
						editorState.containerId
							? "RCE enabled"
							: "Enable remote code execution"
					} `}
					onClick={() =>
						prepareContainer(
							language,
							editorState.containerId
						).then((containerId) => {
							if (!containerId) return;
							dispatch({
								type: "set container id",
								payload: containerId,
							});
						})
					}
				>
					<BiCodeAlt
						size={30}
						className={` ${
							editorState.containerId
								? "text-lime-400"
								: "text-black dark:text-white"
						} mt-2 ml-2 `}
					/>
				</ToolbarButton>
			)}
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
