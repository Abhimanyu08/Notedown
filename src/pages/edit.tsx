import { StateEffect } from "@codemirror/state";
import { vim } from "@replit/codemirror-vim";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BiCodeAlt } from "react-icons/bi";
import { FaFileUpload } from "react-icons/fa";
import { FcGallery } from "react-icons/fc";
import { GiHamburgerMenu } from "react-icons/gi";
import { VscPreview } from "react-icons/vsc";
import {
	ALLOWED_LANGUAGES,
	LOCAL_MARKDOWN_KEY,
	PHOTO_LIMIT,
	SUPABASE_IMAGE_BUCKET,
} from "../../utils/constants";
import getExtensions from "../../utils/getExtensions";
import { getHtmlFromMarkdown } from "../../utils/getResources";
import {
	handlePostUpdate,
	handlePostUpload,
} from "../../utils/handleUploadsAndUpdates";
import { makeFolderName, processImageName } from "../../utils/makeFolderName";
import { sendRequestToRceServer } from "../../utils/sendRequest";
import { supabase } from "../../utils/supabaseClient";
import { Blog } from "../components/BlogPostComponents/Blog";
import BlogLayout from "../components/BlogPostComponents/BlogLayout";
import { Toc } from "../components/BlogPostComponents/TableOfContents";
import EditorHelperComponent from "../components/EditorHelperComponent";
import Layout from "../components/Layout";
import GalleryModal from "../components/Modals/GalleryModal";
import SmallScreenFooter from "../components/SmallScreenFooter";
import useEditor from "../hooks/useEditor";
import usePrivatePostQuery from "../hooks/usePrivatePost";
import useShortCut from "../hooks/useShortcut";
import { CanvasImageContext, UserContext } from "./_app";

const initialMarkdown =
	'---\ntitle: "Your Title"\ndescription: "Your Description"\nlanguage: "python"\n---\n\n';

function Edit() {
	const { user } = useContext(UserContext);
	const router = useRouter();
	const { postId } = router.query;
	const [currPostId, setCurrPostId] = useState<number>();
	const { data, error, loading } = usePrivatePostQuery({
		postId: currPostId,
		loggedInUser: user || null,
	});

	const [showContent, setShowContents] = useState(false);
	const [editingMarkdown, setEditingMarkdown] = useState(true);
	const [hasMarkdownChanged, setHasMarkdownChanged] = useState(false);
	const [uploadingChanges, setUploadingChanges] = useState(false);
	const [images, setImages] = useState<File[]>([]);
	const [canvasImages, setCanvasImages] = useState<
		Record<string, any | null>
	>({});
	const [prevImages, setPrevImages] = useState<string[]>([]);
	const [imageToUrl, setImageToUrl] = useState<Record<string, string>>({});
	const [toBeDeletedFromStorage, setToBeDeletedFromStorage] = useState<
		string[]
	>([]);
	const [enabledVimForMarkdown, setEnabledVimForMarkdown] = useState(false);
	const [containerId, setContainerId] = useState<string>();
	const [mounted, setMounted] = useState(false);

	const [blogData, setBlogData] = useState<{
		title: string;
		description: string;
		language?: (typeof ALLOWED_LANGUAGES)[number];
		content?: string;
	}>({ title: "", description: "" });

	const { editorView } = useEditor({
		language: "markdown",
		code: data?.markdown || initialMarkdown,
		editorParentId: "markdown-textarea",
		mounted,
	});

	useShortCut({
		keys: ["Alt", "p"],
		callback: () => setEditingMarkdown((prev) => !prev),
	});

	useEffect(() => {
		if (!mounted) setMounted(true);
	}, []);

	useEffect(() => {
		//change the editor cursor to the end of markdown.
		if (!editorView) return;

		const docLength = editorView?.state.doc.length;
		editorView.dispatch({
			selection: { anchor: docLength, head: docLength },
		});
	}, [editorView]);

	useEffect(() => {
		//if user is modifying previous post, get the names of his previous images.

		if (user && typeof postId === "string") {
			setCurrPostId(parseInt(postId));
			let imageFolder =
				data?.image_folder || makeFolderName(user.id, postId);
			supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.list(imageFolder)
				.then((val) => {
					if (val.data) {
						setPrevImages(
							val.data
								.map((i) => i.name)
								.filter((i) => !i.startsWith("canvas"))
						);
						const prevImageToUrl: Record<string, string> = {};
						val.data.forEach((i) => {
							if (i.name.startsWith("canvas")) return;
							const { publicURL } = supabase.storage
								.from(SUPABASE_IMAGE_BUCKET)
								.getPublicUrl(`${imageFolder}/${i.name}`);
							if (publicURL) prevImageToUrl[i.name] = publicURL;
						});

						setImageToUrl((prev) => ({
							...prev,
							...prevImageToUrl,
						}));
					}
				});
		}
	}, [postId]);

	useEffect(() => {
		setBlogData({
			title: data?.title || "Your title",
			description: data?.description || "Your description",
			language: data?.language,
			content: data?.content,
		});
	}, [data]);

	useEffect(() => {
		let obj: Record<string, string> = {};
		images.forEach((image) => {
			const imageName = processImageName(image.name);
			if (Object.hasOwn(imageToUrl, imageName)) return;
			obj[imageName] = (window.URL || window.webkitURL).createObjectURL(
				image
			);
		});

		setImageToUrl((prev) => ({ ...prev, ...obj }));
	}, [images]);

	useEffect(() => {
		if (
			toBeDeletedFromStorage.length > 0 ||
			Object.keys(canvasImages).length > 0
		)
			setHasMarkdownChanged(true);
	}, [toBeDeletedFromStorage, canvasImages]);

	useEffect(() => {
		if (!editorView) return;

		if (!editingMarkdown) {
			const changed =
				data?.markdown !== editorView.state.doc.toJSON().join("\n");
			setHasMarkdownChanged((prev) => prev || changed);
		}
	}, [editingMarkdown]);

	const onLanguageChange = (containerId: string | undefined) => {
		// kills the container if the user changes the language
		if (containerId) sendRequestToRceServer("DELETE", { containerId });
		setContainerId(undefined);
	};

	useEffect(() => {
		if (containerId) {
			window.onbeforeunload = async () => {
				setContainerId(undefined);
				await sendRequestToRceServer("DELETE", { containerId });
			};
		}

		return () => {
			if (containerId) sendRequestToRceServer("DELETE", { containerId });
		};
	}, [containerId]);

	useEffect(() => {
		if (editingMarkdown) return;

		const markdown = editorView?.state.doc.toJSON().join("\n");
		if (!markdown) return;
		getHtmlFromMarkdown(markdown)
			.then(({ data, content }) => {
				if (data.language !== blogData.language) {
					onLanguageChange(containerId);
				}
				setBlogData({
					title: data.title,
					description: data.description,
					language: data.language,
					content,
				});
			})
			.catch((e) => {
				alert(e.message);
				setEditingMarkdown(true);
			});
	}, [editingMarkdown]);

	useEffect(() => {
		if (!editorView) return;

		if (enabledVimForMarkdown) {
			editorView.dispatch({
				effects: StateEffect.reconfigure.of([
					vim(),
					...getExtensions({
						language: "markdown",
					}),
				]),
			});
		}

		if (!enabledVimForMarkdown) {
			editorView.dispatch({
				effects: StateEffect.reconfigure.of(
					getExtensions({
						language: "markdown",
					})
				),
			});
		}
	}, [enabledVimForMarkdown]);

	const onNewPostUpload = async () => {
		if (!editorView || !hasMarkdownChanged) return;

		const markdown = editorView.state.doc.toJSON().join("\n");

		//if user is not logged in save his changes to localstorage
		if (!postId && !user) {
			localStorage.setItem(LOCAL_MARKDOWN_KEY, markdown);
			setHasMarkdownChanged(false);
			return;
		}

		if (!user) return;

		setUploadingChanges(true);

		const newFile = new File([markdown], "file.md");

		let imagesToUpload: File[] = images.slice(
			0,
			PHOTO_LIMIT - (prevImages.length - toBeDeletedFromStorage.length)
		);

		Object.keys(canvasImages).forEach(async (canvasImageName) => {
			const app = canvasImages[canvasImageName];

			// we need to delete the previous canvas images because user has redrawn them.
			toBeDeletedFromStorage.push(`${canvasImageName}.png`);
			if (app === null) return;
			const newCanvasImage = await app.getImage("png");
			if (newCanvasImage)
				imagesToUpload.push(
					new File([newCanvasImage], `${canvasImageName}.png`)
				);
		});

		const params: Parameters<typeof handlePostUpload>[0] = {
			userId: user.id,
			postMetadata: {
				title: blogData.title,
				description: blogData.description,
				language: blogData.language,
			},
			markdownFile: newFile,
			imagesToUpload,
		};

		const postFunctionCleanup = () => {
			setUploadingChanges(false);
			setPrevImages((prev) => {
				return prev
					.filter((i) => !toBeDeletedFromStorage.includes(i))
					.concat(images.map((i) => processImageName(i.name)));
			});

			setToBeDeletedFromStorage([]);
			setImages([]);
			setHasMarkdownChanged(false);
			setEditingMarkdown(false);
			alert("Private Post Uploaded successfully.");
		};

		if (currPostId) {
			handlePostUpdate({
				...params,
				postId: currPostId,
				imagesToDelete: toBeDeletedFromStorage,
			})
				.then(() => postFunctionCleanup())
				.catch((e) => alert(e.message));
			return;
		}

		handlePostUpload(params)
			.then((post) => {
				setCurrPostId(post?.id);
				postFunctionCleanup();
			})
			.catch((e) => alert(e.message));
	};

	const prepareContainer = async () => {
		if (containerId || !blogData.language) return;
		try {
			const resp = await sendRequestToRceServer("POST", {
				language: blogData.language,
			});

			if (resp.status !== 201) {
				console.log(resp.statusText);
				alert("Couldn't set up remote code execution");
				return;
			}
			const body: { containerId: string } = await resp.json();
			setContainerId(body.containerId);
		} catch (_) {
			alert("Couldn't enable remote code execution");
		}
	};

	if (error) {
		return (
			<Layout user={user || null} route={"/"} logoutCallback={() => null}>
				<p>Error in fetching post {error.message}</p>
			</Layout>
		);
	}

	if (loading) {
		return (
			<Layout user={null} route={"/"} logoutCallback={() => null}>
				<div
					className={`mx-auto prose  max-w-none lg:w-5/6 xl:w-4/6 prose-headings:text-cyan-500 text-white prose-a:text-amber-400 prose-strong:text-amber-500
				prose-pre:m-0 prose-pre:p-0 animate-pulse
				`}
				>
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
		<Layout user={user || null} route={router.asPath}>
			<GalleryModal
				currImages={images.map((i) => processImageName(i.name))}
				prevImages={prevImages}
				imageToUrl={imageToUrl}
				{...{
					toBeDeletedFromStorage,
					setImages,
					setToBeDeletedFromStorage,
				}}
			/>
			<CanvasImageContext.Provider
				value={{ canvasImages, setCanvasImages }}
			>
				<BlogLayout showContent={showContent}>
					<Toc
						html={blogData?.content || ""}
						setShowContents={setShowContents}
					/>
					<>
						<div
							className={`h-full ${
								editingMarkdown ? "invisible" : ""
							}`}
						>
							<Blog
								content={blogData?.content}
								title={blogData?.title}
								language={blogData?.language}
								description={blogData?.description}
								created_by={user?.id}
								imageToUrl={imageToUrl}
								image_folder={data?.image_folder}
								containerId={containerId}
							/>
						</div>
						<div
							className={`flex flex-col absolute top-0 left-0 h-full w-full ${
								editingMarkdown ? "" : "invisible"
							}`}
						>
							<EditorHelperComponent
								{...{
									editorView,
									enabledVimForMarkdown,
									setEnabledVimForMarkdown,
								}}
							/>
							<div
								className={`grow pb-20 lg:pb-0 overflow-y-auto  w-full`}
								id="markdown-textarea"
							></div>
						</div>
					</>

					<>
						<div
							className={`btn btn-circle ${
								containerId ? "" : "btn-ghost"
							} tooltip ${blogData.language ? "" : "invisible"}`}
							data-tip={` ${
								containerId
									? "RCE enabled"
									: "Enable remote code execution"
							} `}
							onClick={prepareContainer}
						>
							<BiCodeAlt
								size={30}
								className={` ${
									containerId
										? "text-lime-400"
										: "text-black dark:text-white"
								} mt-2 ml-2 `}
							/>
						</div>
						<div
							className="btn btn-circle btn-ghost tooltip"
							data-tip={
								editingMarkdown
									? "Preview (Alt+P)"
									: "Edit Markdown (Alt+P)"
							}
							onClick={() => setEditingMarkdown((prev) => !prev)}
						>
							{editingMarkdown ? (
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
						</div>

						<div
							className="relative w-fit"
							onClick={onNewPostUpload}
						>
							<span
								className={`absolute rounded-full dark:bg-yellow-400 bg-amber-500 w-2 h-2 right-0 ${
									hasMarkdownChanged ? "" : "hidden"
								} ${uploadingChanges ? "animate-ping" : ""}`}
							></span>
							<div
								className="btn btn-circle btn-ghost tooltip"
								data-tip={
									hasMarkdownChanged
										? `${
												currPostId
													? "Save Changes"
													: `${
															user
																? "Upload Private Post"
																: "Save changes Locally"
													  }`
										  }`
										: "No changes"
								}
							>
								<FaFileUpload
									size={28}
									className={` ${
										hasMarkdownChanged
											? "text-black dark:text-white"
											: "dark:text-white/50 text-gray-700"
									} mt-2 ml-2`}
								/>
							</div>
						</div>

						<label
							className="btn btn-circle btn-ghost tooltip"
							data-tip={`Gallery`}
							htmlFor={`gallery`}
						>
							<FcGallery size={28} className="mt-2 ml-2" />
						</label>
					</>
				</BlogLayout>
			</CanvasImageContext.Provider>
			<SmallScreenFooter>
				<div
					className="flex flex-col items-center gap-1"
					onClick={prepareContainer}
				>
					<BiCodeAlt
						size={21}
						className={` ${
							containerId ? "text-lime-400" : "text-white"
						}`}
					/>
					<span
						className={` ${
							containerId ? "text-lime-400" : "text-white"
						} `}
					>
						Activate RCE
					</span>
				</div>
				<div
					className="flex flex-col items-center text-white gap-1"
					onClick={() => setEditingMarkdown((prev) => !prev)}
				>
					{editingMarkdown ? (
						<VscPreview size={20} className="text-white" />
					) : (
						<AiFillEdit size={20} className="text-white" />
					)}
					<span className="">
						{editingMarkdown ? "Preview" : "Edit"}
					</span>
				</div>

				<label
					className="flex flex-col items-center gap-1 text-white"
					htmlFor="gallery"
				>
					<FcGallery size={22} className="" />
					<span className="">Gallery</span>
				</label>

				<div
					className="flex flex-col items-center w-fit gap-1"
					onClick={onNewPostUpload}
				>
					<div className="relative">
						<FaFileUpload
							size={18}
							className={` ${
								hasMarkdownChanged ? "text-white" : ""
							} mt-2 ml-2`}
						/>
						<span
							className={`absolute rounded-full bg-yellow-400 w-2 h-2 top-0 left-6 ${
								hasMarkdownChanged ? "" : "hidden"
							} ${uploadingChanges ? "animate-ping" : ""}`}
						></span>
					</div>

					<span className=" text-white">
						{hasMarkdownChanged
							? `${
									currPostId
										? "Save"
										: `${user ? "Upload" : "Save Locally"}`
							  }`
							: "No changes"}
					</span>
				</div>
				<div
					className="flex flex-col items-center gap-1 text-white"
					onClick={() => setShowContents((prev) => !prev)}
				>
					<GiHamburgerMenu size={18} />
					<span className="">Contents</span>
				</div>
			</SmallScreenFooter>
		</Layout>
	);
}

export default Edit;
