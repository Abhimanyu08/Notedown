import { BlogContext } from "@components/BlogPostComponents/BlogState";
import ToolbarButton from "@/app/post/components/ToolbarButton";
import prepareContainer from "@/app/utils/prepareContainer";
import { getHtmlFromMarkdownFile } from "@utils/getResources";
import { memo, useContext, useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BiCodeAlt } from "react-icons/bi";
import { FaFileUpload } from "react-icons/fa";
import { TfiGallery } from "react-icons/tfi";
import { VscLoading, VscPreview } from "react-icons/vsc";
import useUploadPost from "../hooks/useUploadPost";
import { EditorContext } from "./EditorContext";

function EditorToolbar() {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const { language } = blogState.blogMeta;
	const [startUpload, setStartUpload] = useState(false);
	const [changed, setChanged] = useState(false);

	const { uploading, uploadStatus, newPostId, uploadFinished } =
		useUploadPost({
			startUpload,
		});

	useEffect(() => {
		//check for changed in markdown every 2 seconds

		if (!editorState.editorView || !editorState.previousUploadedDoc) return;
		const interval = window.setInterval(() => {
			const hasChanged = !editorState.editorView!.state.doc.eq(
				editorState.previousUploadedDoc!
			);

			setChanged(hasChanged);
		}, 2000);

		return () => {
			clearInterval(interval);
		};
	}, [editorState.editorView, editorState.previousUploadedDoc]);

	useEffect(() => {
		if (uploadFinished) {
			setStartUpload(false);
		}
	}, [uploadFinished]);

	const onUpload = async (currentEditorState: typeof editorState) => {
		//Just before starting to upload we need to convert markdown to content one last time in case user has pressed upload button without prevewing and his `imagesToUpload` and `imagesToDelete` are not in sync.
		await getHtmlFromMarkdownFile(
			currentEditorState.editorView?.state.sliceDoc() || ""
		)
			.then((val) => {
				if (!val) return;

				blogStateDispatch({
					type: "set blog meta",
					payload: { ...val?.data, content: val?.content },
				});
			})
			.catch((e) => {
				alert((e as Error).message);
			});

		if (changed || Object.keys(currentEditorState.canvasApps).length > 0)
			setStartUpload(true);
		dispatch({
			type: "set previous uploaded doc",
			payload: currentEditorState.editorView!.state.doc,
		});
	};

	return (
		<>
			<ToolbarButton
				className={`${language ? "" : "invisible"}`}
				tip={` ${
					blogState.containerId
						? "RCE enabled"
						: "Enable remote code execution"
				} `}
				onClick={() => {
					console.log(`${blogState.containerId}`);
					prepareContainer(language, blogState.containerId).then(
						(containerId) => {
							if (!containerId) return;
							blogStateDispatch({
								type: "set containerId",
								payload: containerId,
							});
						}
					);
				}}
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
				tip={uploading ? "" : "Upload Post/changes"}
				onClick={() => onUpload(editorState)}
			>
				{uploading ? (
					<div className="flex gap-2 items-center">
						<VscLoading size={26} className="animate-spin" />
						<p className="text-xs w-48 truncate">{uploadStatus}</p>
					</div>
				) : (
					<div className="flex gap-2 items-center">
						<FaFileUpload size={26} />
						{(Object.keys(editorState.canvasApps).length > 0 ||
							changed) && (
							<sup className="text-lg text-white">*</sup>
						)}
					</div>
				)}
			</ToolbarButton>
		</>
	);
}

export default memo(EditorToolbar);
