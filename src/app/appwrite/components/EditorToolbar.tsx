import ToolbarButton from "@/app/apppost/components/ToolbarButton";
import { useContext } from "react";
import { AiFillEdit } from "react-icons/ai";
import { VscPreview } from "react-icons/vsc";
import { EditorContext } from "./EditorContext";
import prepareContainer from "@/app/utils/prepareContainer";
import { BiCodeAlt } from "react-icons/bi";
import { BlogContext } from "@/app/apppost/components/BlogState";

function EditorToolbar() {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const { language } = blogState.blogMeta;

	return (
		<>
			{language && (
				<ToolbarButton
					className=""
					tip={` ${
						blogState.containerId
							? "RCE enabled"
							: "Enable remote code execution"
					} `}
					onClick={() =>
						prepareContainer(language, blogState.containerId).then(
							(containerId) => {
								if (!containerId) return;
								blogStateDispatch({
									type: "set containerId",
									payload: containerId,
								});
							}
						)
					}
				>
					<BiCodeAlt
						size={30}
						className={` ${
							blogState.containerId
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
