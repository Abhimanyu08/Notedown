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
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { ArrowUpToLine } from "lucide-react";
import { LoginDialog } from "@components/BlogPostComponents/LoginDialog";

function WriteToolbar({ content }: { content: string }) {
	const [showToc, setShowToc] = useState(false);
	const { editorState, dispatch } = useContext(EditorContext);
	const { blogState } = useContext(BlogContext);
	const [startUpload, setStartUpload] = useState(false);

	const [openLoginDialog, setOpenLoginDialog] = useState(false);
	const { toast } = useToast();
	const { session } = useSupabase();

	const { uploadFinished, uploadError, progressMessage } = useUploadPost({
		startUpload,
	});

	const onUpload = () => {
		setStartUpload(true);
	};
	useEffect(() => {
		setStartUpload(false);
		if (uploadFinished && !uploadError) {
			toast({
				title: "Note uploaded!",
				duration: 2000,
			});
			dispatch({
				type: "set previous uploaded doc",
				payload: editorState.editorView!.state.doc,
			});
		}
	}, [uploadFinished]);

	// useEffect(() => {
	// 	const uploadedMarkdown = editorState.previousUploadedDoc;
	// 	if (!uploadedMarkdown) return;
	// 	const writtenMarkdown = editorState.editorView?.state.doc;
	// 	if (!writtenMarkdown) return;

	// 	setInSync(uploadedMarkdown.eq(writtenMarkdown));
	// }, [editorState]);

	return (
		<>
			<div className="flex absolute bottom-0 right-0 h-fit w-[55%] z-[400]  justify-between px-14 items-center border-t-2  bg-secondary   border-border [&>*]:p-2">
				{progressMessage && !uploadFinished ? (
					<div className="flex items-center gap-4 m-2">
						<VscLoading className="animate-spin" />
						<p>{progressMessage}</p>
					</div>
				) : (
					<>
						<EnableRceButton side="top" />
						<ToolTipComponent
							className=" hover:text-gray-100 text-gray-400 disabled:text-gray-700"
							onClick={() => {
								if (!session?.user) {
									setOpenLoginDialog(true);
									return;
								}
								onUpload();
							}}
							tip="Upload note"
							side="top"
							// disabled={editorState.inSyncWithUploadedVersion}
						>
							<ArrowUpToLine />
						</ToolTipComponent>
						<ToolTipComponent
							tip="Table of contents"
							side="top"
							className="hover:text-gray-100 text-gray-400 "
							onClick={() => setShowToc((p) => !p)}
						>
							<BiBookContent size={25} />
						</ToolTipComponent>
						<div className="flex items-center gap-1 hover:text-gray-100 text-gray-400 ">
							<Switch
								id="sync locally"
								checked={editorState.syncLocally}
								onCheckedChange={() =>
									dispatch({
										type: "sync locally",
										payload: null,
									})
								}
								className="scale-90 data-[state=checked]:hover:bg-primary  data-[state=checked]:bg-gray-400"
							/>
							<Label htmlFor="sync locally" className="text-sm">
								{editorState.syncLocally
									? "Local syncing: On"
									: "Local syncing: Off"}
							</Label>
						</div>
						<div
							className={`h-fit absolute bottom-full py-4 px-5 bg-secondary right-0  border-border border-2  w-[400px] max-h-[450px] overflow-auto z-[1000]
						${showToc ? "visible" : "invisible"}
						rounded-t-md
					`}
							// onMouseLeave={() => setShowToc(false)}
						>
							<Toc markdown={content} />
						</div>
					</>
				)}
			</div>

			<LoginDialog
				dialog="Please login to upload your note"
				open={openLoginDialog}
				setOpen={setOpenLoginDialog}
			/>
		</>
	);
}

export default WriteToolbar;
