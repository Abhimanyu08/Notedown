import { BlogContext } from "@components/BlogPostComponents/BlogState";
import EnableRceButton from "@components/BlogPostComponents/EnableRceButton";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { useContext, useEffect, useState } from "react";
import { BiBookContent } from "react-icons/bi";
import { FaFileUpload } from "react-icons/fa";
import useUploadPost from "../hooks/useUploadPost";
import { EditorContext } from "./EditorContext";
import { VscLoading } from "react-icons/vsc";
import { useToast } from "@components/ui/use-toast";
import { useSupabase } from "@/app/appContext";

function WriteToolbar({ content }: { content: string }) {
	const [showToc, setShowToc] = useState(false);
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState } = useContext(BlogContext);
	const [startUpload, setStartUpload] = useState(false);
	const { toast } = useToast();
	const { session } = useSupabase();

	const { uploadFinished, progressMessage } = useUploadPost({
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
			toast({
				title: "Note uploaded!",
				duration: 2000,
			});
		}
	}, [uploadFinished]);

	return (
		<div className="flex absolute bottom-0 right-0 h-fit w-[55%] z-[400]  justify-center gap-32 px-10 items-center border-t-2  bg-secondary   border-border [&>*]:p-2">
			{progressMessage && !uploadFinished ? (
				<div className="flex items-center gap-4 m-2">
					<VscLoading className="animate-spin" />
					<p>{progressMessage}</p>
				</div>
			) : (
				<>
					{blogState.blogMeta.language && (
						<EnableRceButton side="top" />
					)}
					{session?.user.id && (
						<ToolTipComponent
							tip="Upload changes"
							side="top"
							align="center"
						>
							<button
								className=" hover:text-gray-100 text-gray-400"
								onClick={() => onUpload(editorState)}
							>
								<FaFileUpload size={24} className="mt-1" />
							</button>
						</ToolTipComponent>
					)}
					<Button
						className="bg-transparent hover:bg-transparent hover:text-gray-100 text-gray-400 "
						onClick={() => setShowToc((p) => !p)}
					>
						<BiBookContent size={24} />
					</Button>
					<div
						className={`h-fit absolute bottom-full py-4 px-5 bg-secondary right-0  border-border border-2  w-[400px] max-h-[450px] overflow-auto z-[1000]
						${showToc ? "opacity-100" : "opacity-0"}
						transition-opacity duration-200
					`}
						// onMouseLeave={() => setShowToc(false)}
					>
						<Toc markdown={content} />
					</div>
				</>
			)}
		</div>
	);
}

export default WriteToolbar;
