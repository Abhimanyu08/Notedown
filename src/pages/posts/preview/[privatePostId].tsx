import { useRouter } from "next/router";
import { MouseEventHandler, useContext, useEffect, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BiCodeAlt } from "react-icons/bi";
import { FaFileUpload } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { VscPreview } from "react-icons/vsc";
import { SUPABASE_FILES_BUCKET } from "../../../../utils/constants";
import { getHtmlFromMarkdown } from "../../../../utils/getResources";
import { sendRequestToRceServer } from "../../../../utils/sendRequest";
import { supabase } from "../../../../utils/supabaseClient";
import { Blog } from "../../../components/Blog";
import BlogLayout from "../../../components/BlogLayout";
import Layout from "../../../components/Layout";
import { Toc } from "../../../components/TableOfContents";
import useEditor from "../../../hooks/useEditor";
import usePrivatePostQuery from "../../../hooks/usePrivatePost";
import { UserContext } from "../../_app";

export default function PrivateBlog() {
	const router = useRouter();
	const { privatePostId } = router.query;
	const { user } = useContext(UserContext);
	const { data, error, loading } = usePrivatePostQuery({
		postId: parseInt(privatePostId as string),
		loggedInUser: user || null,
	});
	const [showContent, setShowContents] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [containerId, setContainerId] = useState<string>();
	const [connecting, setConnecting] = useState(false);
	const [editingMarkdown, setEditingMarkdown] = useState(false);
	const [hasMarkdownChanged, setHasMarkdownChanged] = useState(false);
	const [uploadingChanges, setUploadingChanges] = useState(false);

	const [blogData, setBlogData] = useState({
		content: data?.content,
		title: data?.title,
		description: data?.description,
		language: data?.language,
	});

	const { editorView } = useEditor({
		language: "markdown",
		code: data?.markdown || "",
	});

	const [initialMarkdown, setIntialMarkdown] = useState(
		editorView?.state.doc
	);

	useEffect(() => {
		if (editorView && initialMarkdown === undefined)
			setIntialMarkdown(editorView.state.doc);
	}, [editorView]);

	useEffect(() => {
		if (editingMarkdown) return;

		const markdown = editorView?.state.doc.toJSON().join("\n");
		if (!markdown) return;
		getHtmlFromMarkdown(markdown)
			.then(({ data, content }) => {
				setBlogData({
					title: data.title,
					description: data.description,
					language: data.language,
					content,
				});
			})
			.catch((e) => alert(e.message));
	}, [editingMarkdown]);

	useEffect(() => {
		if (!user) router.replace("/");
		if (!mounted) setMounted(true);
	}, []);

	useEffect(() => {
		if (containerId) {
			window.onbeforeunload = async () =>
				await sendRequestToRceServer("DELETE", { containerId });
		}
		return () => {
			if (containerId) sendRequestToRceServer("DELETE", { containerId });
		};
	}, [containerId]);

	const prepareContainer = async () => {
		if (!user) return;
		if (containerId) return;
		setConnecting(true);
		try {
			const resp = await sendRequestToRceServer("POST", {
				language: data?.language || "",
			});

			if (resp.status !== 201) {
				console.log(resp.statusText);
				alert("Couldn't set up remote code execution");
				setConnecting(false);
				return;
			}
			const body: { containerId: string } = await resp.json();
			setContainerId(body.containerId);
			setConnecting(false);
		} catch (_) {
			setConnecting(false);
			alert("Couldn't enable remote code execution");
		}
	};

	useEffect(() => {
		if (!initialMarkdown || !editorView) return;

		setHasMarkdownChanged(
			!(
				initialMarkdown.toJSON().join("\n") ===
				editorView.state.doc.toJSON().join("\n")
			)
		);
	}, [editingMarkdown]);

	const onUploadChange: MouseEventHandler<HTMLDivElement> = async () => {
		if (!hasMarkdownChanged || !user || !editorView) return;

		setUploadingChanges(true);

		const newFile = new File(
			[editorView.state.doc.toJSON().join("\n")],
			""
		);

		await supabase.storage
			.from(SUPABASE_FILES_BUCKET)
			.update(data!.filename!, newFile)
			.then((val) => {
				setUploadingChanges(false);
				if (val?.error) alert(val.error.message);
				if (val && val.data) {
					setHasMarkdownChanged(false);
					setEditingMarkdown(false);
					alert("Changes Uploaded Successfully");
				}
			});
	};

	if (!mounted) {
		return null;
	}
	if (error) {
		return (
			<Layout user={user || null} route={"/"} logoutCallback={() => null}>
				<p>Error in fetching post {error.message}</p>
			</Layout>
		);
	}

	if (loading) {
		return (
			<Layout user={user || null} route={"/"} logoutCallback={() => null}>
				<div>
					<h1 className="h-5 text-center bg-slate-600 rounded w-1/2 mx-auto"></h1>
					<p className="h-3 text-center italic bg-slate-600 rounded"></p>
					<div className="h-32 bg-slate-600 rounded"></div>
					<p className="h-3 text-center italic bg-slate-600 rounded"></p>
					<div className="h-32 bg-slate-600 rounded"></div>
					<p className="h-3 text-center italic bg-slate-600 rounded"></p>
					<div className="h-32 bg-slate-600 rounded"></div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			user={user || null}
			route={router.asPath}
			logoutCallback={() => null}
		>
			<BlogLayout>
				<div
					className={` md:basis-1/5 md:flex md:flex-col md:justify-center ${
						showContent ? "w-screen" : "hidden"
					}`}
				>
					<Toc
						html={blogData.content || data?.content}
						setShowContents={setShowContents}
					/>
				</div>
				<div
					className={`md:basis-3/5 relative ${
						showContent ? "hidden" : "w-screen"
					}`}
				>
					<Blog
						{...data}
						content={blogData.content || data?.content}
						title={blogData.title || data?.title}
						language={blogData.language || data?.language}
						description={blogData.description || data?.description}
						containerId={containerId}
					/>
					<div
						className={`h-full overflow-y-auto absolute top-0 left-0 z-10 w-full ${
							editingMarkdown ? "" : "invisible"
						}`}
						id="markdown-textarea"
					></div>
				</div>
				<div className="hidden md:flex md:flex-col basis-1/5 w-fit mt-44 pl-5 gap-6 z-20">
					<div
						className={` btn btn-circle  btn-ghost tooltip`}
						data-tip="Activate remote code execution"
						onClick={prepareContainer}
					>
						<BiCodeAlt
							size={30}
							className={` ${
								containerId ? "text-lime-400" : "text-white"
							}${connecting ? "hidden" : ""} mt-2 ml-2 `}
						/>
					</div>
					<div
						className="btn btn-circle btn-ghost tooltip"
						data-tip={editingMarkdown ? "Preview" : "Edit Markdown"}
						onClick={() => setEditingMarkdown((prev) => !prev)}
					>
						{editingMarkdown ? (
							<VscPreview
								size={28}
								className="text-white mt-2 ml-2"
							/>
						) : (
							<AiFillEdit
								size={28}
								className="text-white mt-2 ml-2"
							/>
						)}
					</div>
					<div className="relative w-fit" onClick={onUploadChange}>
						<span
							className={`absolute rounded-full bg-yellow-400 w-2 h-2 right-0 ${
								hasMarkdownChanged ? "" : "hidden"
							} ${uploadingChanges ? "animate-ping" : ""}`}
						></span>
						<div
							className="btn btn-circle btn-ghost tooltip"
							data-tip={
								hasMarkdownChanged
									? "Upload Changes"
									: "No changes"
							}
						>
							<FaFileUpload
								size={28}
								className={` ${
									hasMarkdownChanged ? "text-white" : ""
								} mt-2 ml-2`}
							/>
						</div>
					</div>
				</div>
			</BlogLayout>
			<footer className="w-full flex items-center md:hidden justify-evenly p-3  sticky bottom-0 left-0 bg-slate-800 border-t-2 border-white/25">
				<div
					className="flex flex-col items-center"
					onClick={prepareContainer}
				>
					<BiCodeAlt
						size={20}
						className={` ${containerId ? "text-lime-400" : ""}`}
					/>
					<span className="text-xs">Activate RCE</span>
				</div>

				<div
					className="flex flex-col items-center"
					onClick={() => setShowContents((prev) => !prev)}
				>
					<GiHamburgerMenu size={14} />
					<span className="text-xs">Contents</span>
				</div>
			</footer>
		</Layout>
	);
}
