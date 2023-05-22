import ToolbarButton from "@/app/apppost/components/ToolbarButton";
import { useContext, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { VscPreview } from "react-icons/vsc";
import { EditorContext } from "./EditorContext";
import prepareContainer from "@/app/utils/prepareContainer";
import { BiCodeAlt } from "react-icons/bi";
import { TfiGallery } from "react-icons/tfi";
import { BlogContext } from "@/app/apppost/components/BlogState";

function EditorToolbar() {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const { language } = blogState.blogMeta;

	return (
		<>
			{/* <GalleryModal /> */}
			<input
				type="file"
				onChange={(e) => {
					if (!e.currentTarget.files) return;
					const file = e.currentTarget.files[0];
					let fileName = file.name;
					fileName = fileName
						.split(" ")
						.map((i) => i.toLowerCase())
						.join("");
					blogStateDispatch({
						type: "set image folder",
						payload: {
							[fileName]: file,
						},
					});
				}}
				id="gallery"
				accept="image/*"
				className="hidden"
			/>
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
		</>
	);
}

// function GalleryModal() {
// 	const [show, setShow] = useState(false);
// 	return (
// 		<>
// 			<input
// 				type="checkbox"
// 				name=""
// 				id="gallery"
// 				className="hidden"
// 				onChange={(e) => setShow(e.currentTarget.checked)}
// 			/>
// 			<label
// 				className={`absolute top-0 left-0 w-1/2 h-1/2 bg-red-400  ${
// 					show ? "block" : "hidden"
// 				}`}
// 				htmlFor="gallery"
// 			>
// 				hello
// 			</label>
// 		</>
// 	);
// }

export default EditorToolbar;
