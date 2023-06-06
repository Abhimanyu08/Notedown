import ToolbarButton from "@/app/apppost/components/ToolbarButton";
import { motion } from "framer-motion";
import { memo, useContext, useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { VscLoading, VscPreview } from "react-icons/vsc";
import { EditorContext } from "./EditorContext";
import prepareContainer from "@/app/utils/prepareContainer";
import { BiCodeAlt } from "react-icons/bi";
import { TfiGallery } from "react-icons/tfi";
import { CgDanger } from "react-icons/cg";
import { BlogContext } from "@/app/apppost/components/BlogState";
import { FaFileUpload } from "react-icons/fa";
import useUploadPost from "../hooks/useUploadPost";
import Link from "next/link";

function EditorToolbar() {
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
	const { language } = blogState.blogMeta;
	const [startUpload, setStartUpload] = useState(false);
	const [changed, setChanged] = useState(false);

	const { uploading, uploadStatus, newPostId } = useUploadPost({
		startUpload,
	});

	useEffect(() => {
		if (startUpload && !uploading) {
			setStartUpload(false);

			dispatch({
				type: "set previous uploaded doc",
				payload: editorState.editorView!.state.doc,
			});
		}
	}, [startUpload]);

	useEffect(() => {
		if (!editorState.editorView || !editorState.previousUploadedDoc) return;
		const interval = window.setInterval(() => {
			const hasChanged =
				Object.keys(blogState.canvasApps).length > 0 ||
				!editorState.editorView!.state.doc.eq(
					editorState.previousUploadedDoc!
				);

			console.log(hasChanged);
			setChanged(!!hasChanged);
		}, 2000);

		return () => {
			clearInterval(interval);
		};
	}, [editorState.editorView, editorState.previousUploadedDoc]);

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
				onClick={() => setStartUpload(true)}
			>
				{uploading ? (
					<div className="flex gap-2 items-center">
						<VscLoading size={26} className="animate-spin" />
						<p className="text-xs w-48 truncate">{uploadStatus}</p>
					</div>
				) : (
					<div className="flex gap-2 items-center">
						<FaFileUpload size={26} />
						{changed && <sup className="text-lg text-white">*</sup>}
					</div>
				)}
			</ToolbarButton>

			{newPostId && (
				<motion.p
					initial={{ opacity: 1 }}
					animate={{ opacity: 0 }}
					transition={{
						duration: 10,
					}}
				>
					{blogState.blogMeta.id ? (
						<p>Post Updated !!</p>
					) : (
						<>
							<Link
								href={`/apppost/${newPostId}`}
								className="underline underline-offset-2"
							>
								New Post
							</Link>{" "}
							Uploaded!
						</>
					)}
				</motion.p>
			)}
		</>
	);
}

export default memo(EditorToolbar);
