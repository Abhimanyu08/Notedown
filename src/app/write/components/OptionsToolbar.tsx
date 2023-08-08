import { BlogContext } from "@components/BlogPostComponents/BlogState";
import EnableRceButton from "@components/BlogPostComponents/EnableRceButton";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { BiBookContent } from "react-icons/bi";
import { FaFileUpload } from "react-icons/fa";
import useUploadPost from "../hooks/useUploadPost";
import { EditorContext } from "./EditorContext";

function OptionsToolbar({ content }: { content: string }) {
	const [showToc, setShowToc] = useState(false);
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState } = useContext(BlogContext);
	const [startUpload, setStartUpload] = useState(false);

	const { uploadFinished } = useUploadPost({
		startUpload,
	});

	const onUpload = async (currentEditorState: typeof editorState) => {
		setStartUpload(true);
		dispatch({
			type: "set previous uploaded doc",
			payload: currentEditorState.editorView!.state.doc,
		});
	};
	useEffect(() => {
		if (uploadFinished) {
			setStartUpload(false);
		}
	}, [uploadFinished]);
	return (
		<>
			<div className="flex flex-col items-center absolute gap-3 right-0 top-[45%]  bg-black opacity-40 hover:opacity-100 hover:z-[2000] -z-[0]  w-fit border-r-0  border-[1px] border-border [&>*]:p-2">
				{blogState.blogMeta.language && <EnableRceButton />}
				<ToolTipComponent tip="Upload changes" side="right">
					<button
						className=" hover:text-gray-100 text-gray-400"
						onClick={() => onUpload(editorState)}
					>
						<FaFileUpload size={26} />
					</button>
				</ToolTipComponent>
				<Button
					className="bg-transparent hover:text-gray-100 text-gray-400 hover:bg-black"
					onClick={() => setShowToc((p) => !p)}
				>
					<BiBookContent size={24} />
				</Button>
			</div>
			<AnimatePresence>
				{showToc && (
					<motion.div
						className="h-fit absolute py-4 px-5 bg-black right-12 top-[40%] border-border border-[1px]  w-[400px] max-h-[450px] overflow-auto shadow-sm shadow-gray-200 z-[1000]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onMouseLeave={() => setShowToc(false)}
					>
						<Toc markdown={content} />
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

export default OptionsToolbar;
