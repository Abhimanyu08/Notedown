import ToolbarButton from "@/app/apppost/components/ToolbarButton";
import { useContext, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { VscPreview } from "react-icons/vsc";
import { EditorContext } from "./EditorContext";
import prepareContainer from "@/app/utils/prepareContainer";
import { BiCodeAlt } from "react-icons/bi";
import { TfiGallery } from "react-icons/tfi";
import { GrDocumentUpload } from "react-icons/gr";
import { BlogContext } from "@/app/apppost/components/BlogState";
import { FaFileUpload } from "react-icons/fa";
import useUploadPost from "../hooks/useUploadPost";

function EditorToolbar() {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const { language } = blogState.blogMeta;

	const [startUpload, setStartUpload] = useState(false);

	useUploadPost({ startUpload });

	return (
		<>
			<ToolbarButton
				className={`${language ? "" : "invisible"}`}
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
						blogState.containerId ? "text-lime-400" : ""
					}`}
				/>
			</ToolbarButton>
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
					<VscPreview size={28} />
				) : (
					<AiFillEdit size={28} />
				)}
			</ToolbarButton>
			<ToolbarButton tip="Gallery">
				<label htmlFor="gallery">
					<TfiGallery size={24} />
				</label>
			</ToolbarButton>
			<ToolbarButton
				tip="Upload post/changes"
				onClick={() => setStartUpload(true)}
			>
				<FaFileUpload size={26} />
			</ToolbarButton>
		</>
	);
}

export default EditorToolbar;
