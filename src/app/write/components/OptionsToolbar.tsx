import prepareContainer from "@/app/utils/prepareContainer";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { BiCodeAlt } from "react-icons/bi";
import { FaFileUpload } from "react-icons/fa";
import { SlOptions } from "react-icons/sl";
import useUploadPost from "../hooks/useUploadPost";
import { EditorContext } from "./EditorContext";
import EnableRceButton from "@components/BlogPostComponents/EnableRceButton";
import { ToolTipComponent } from "@components/ToolTipComponent";

function OptionsToolbar() {
	const [openOptions, setOpenOptions] = useState(false);

	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState, dispatch: blogStateDispatch } = useContext(BlogContext);
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
			{openOptions ? (
				<AnimatePresence>
					<motion.div
						className="px-4 py-2 z-40  flex gap-8 rounded-md bg-black absolute text-gray-400 border-[1px] border-border
                        
                        [&>*]:active:scale-95
                        "
						style={{
							left: "calc(50% - 60px)",
							bottom: "90px",
						}}
						key={openOptions ? "open" : "close"}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onMouseLeave={() => {
							setOpenOptions(false);
						}}
					>
						<EnableRceButton />
						<ToolTipComponent tip="Upload changes" side="right">
							<button
								className=" hover:text-gray-100"
								onClick={() => onUpload(editorState)}
							>
								<FaFileUpload size={26} />
							</button>
						</ToolTipComponent>
					</motion.div>
				</AnimatePresence>
			) : (
				<AnimatePresence>
					<motion.button
						className="absolute flex items-center justify-center p-2 bg-primary-foreground border-border border-[1px] rounded-full opacity-20 hover:opacity-100 "
						onMouseOver={() => setOpenOptions(true)}
						key={openOptions ? "close" : "open"}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						style={{
							left: "calc(50% - 20px)",
							bottom: "90px",
						}}
					>
						<SlOptions />
					</motion.button>
				</AnimatePresence>
			)}
		</>
	);
}

export default OptionsToolbar;
