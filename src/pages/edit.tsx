import { useRouter } from "next/router";
import { StateEffect } from "@codemirror/state";
import { useContext, useEffect, useState } from "react";
import {
	AiFillEdit,
	AiOutlineOrderedList,
	AiOutlineUnorderedList,
} from "react-icons/ai";
import { BiCodeAlt, BiImageAdd } from "react-icons/bi";
import { GoListOrdered, GoListUnordered } from "react-icons/go";
import { FaBold, FaFileUpload, FaItalic } from "react-icons/fa";
import { FcGallery } from "react-icons/fc";
import { GiHamburgerMenu } from "react-icons/gi";
import { VscPreview } from "react-icons/vsc";
import {
	ALLOWED_LANGUAGES,
	LOCAL_MARKDOWN_KEY,
	PHOTO_LIMIT,
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "../../utils/constants";
import {
	onBlockQuote,
	onBold,
	onCanvas,
	onCodeBlock,
	onCodeWord,
	onImage,
	onItalic,
	onLatex,
	onLink,
	onOrdererdList,
	onSelect,
	onUnordererdList,
} from "../../utils/editorToolFunctions";
import { getHtmlFromMarkdown } from "../../utils/getResources";
import makeFolderName from "../../utils/makeFolderName";
import { supabase } from "../../utils/supabaseClient";
import { Blog } from "../components/Blog";
import BlogLayout from "../components/BlogLayout";
import DeleteImagesModal from "../components/DeleteImagesModal";
import ImageCopy from "../components/ImageCopy";
import Layout from "../components/Layout";
import SmallScreenFooter from "../components/SmallScreenFooter";
import { Toc } from "../components/TableOfContents";
import useEditor from "../hooks/useEditor";
import usePrivatePostQuery from "../hooks/usePrivatePost";
import Post from "../interfaces/Post";
import { CanvasImageContext, UserContext } from "./_app";
import { SiVim } from "react-icons/si";
import getExtensions from "../../utils/getExtensions";
import { vim } from "@replit/codemirror-vim";
import { sendRequestToRceServer } from "../../utils/sendRequest";

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
	const [canvasImages, setCanvasImages] = useState<File[]>([]);
	const [prevImages, setPrevImages] = useState<string[]>([]);
	const [imageToUrl, setImageToUrl] = useState<Record<string, string>>({});
	const [toBeDeletedFromStorage, setToBeDeletedFromStorage] = useState<
		string[]
	>([]);
	const [copiedImageName, setCopiedImageName] = useState("");
	const [showGallery, setShowGallery] = useState(false);
	const [cumulativeImageName, setCumulativeImageName] = useState("");
	const [enabledVimForMarkdown, setEnabledVimForMarkdown] = useState(false);
	const [containerId, setContainerId] = useState<string>();

	const [blogData, setBlogData] = useState<{
		title?: string;
		description?: string;
		language?: typeof ALLOWED_LANGUAGES[number];
		content?: string;
	}>({});

	const { editorView } = useEditor({
		language: "markdown",
		code: data?.markdown || "",
		editorParentId: "markdown-textarea",
	});

	useEffect(() => {
		if (!editorView) return;

		const docLength = editorView?.state.doc.length;
		editorView.dispatch({
			selection: { anchor: docLength, head: docLength },
		});
	}, [editorView]);

	useEffect(() => {
		if (user && currPostId === undefined && typeof postId === "string") {
			setCurrPostId(parseInt(postId));
			let imageFolder =
				data?.image_folder || makeFolderName(user.id, postId);
			supabase.storage
				.from(SUPABASE_IMAGE_BUCKET)
				.list(imageFolder)
				.then((val) => {
					if (val.data) {
						setPrevImages(val.data.map((i) => i.name));
					}
				});
		}
	}, [postId]);

	useEffect(() => {
		setBlogData({
			title: data?.title,
			description: data?.description,
			language: data?.language,
			content: data?.content,
		});
	}, [data]);

	useEffect(() => {
		let obj: Record<string, string> = {};
		images.forEach((image) => {
			const imageName = image.name;
			if (Object.hasOwn(obj, imageName)) return;
			obj[imageName] = (window.URL || window.webkitURL).createObjectURL(
				image
			);
		});

		setImageToUrl(obj);
	}, [images]);

	useEffect(() => {
		if (toBeDeletedFromStorage.length > 0 || canvasImages.length > 0)
			setHasMarkdownChanged(true);
	}, [toBeDeletedFromStorage, canvasImages]);

	useEffect(() => {
		if (!editorView) return;

		if (!editingMarkdown) {
			const changed =
				toBeDeletedFromStorage.length > 0 ||
				canvasImages.length > 0 ||
				data?.markdown !== editorView.state.doc.toJSON().join("\n");
			setHasMarkdownChanged(changed);
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
		if (!postId && !user) {
			localStorage.setItem(LOCAL_MARKDOWN_KEY, markdown);
			setHasMarkdownChanged(false);
			return;
		}
		if (!user) return;

		setUploadingChanges(true);

		const newFile = new File([markdown], "");
		let validImages = images.slice(0, PHOTO_LIMIT - prevImages.length);
		if (currPostId && data) {
			const imageFolder = makeFolderName(user.id, currPostId);

			if (canvasImages) {
				Promise.all(
					canvasImages.map((ci) => {
						supabase.storage
							.from(SUPABASE_IMAGE_BUCKET)
							.remove([`${imageFolder}/${ci.name}`])
							.then(() => {
								supabase.storage
									.from(SUPABASE_IMAGE_BUCKET)
									.upload(`${imageFolder}/${ci.name}`, ci);
							});
					})
				);
			}

			if (toBeDeletedFromStorage.length > 0) {
				await supabase.storage
					.from(SUPABASE_IMAGE_BUCKET)
					.remove(
						toBeDeletedFromStorage.map(
							(name) => `${imageFolder}/${name}`
						)
					);
			}

			if (validImages.length > 0) {
				const imageResults = await Promise.all(
					validImages.map((image) => {
						const imagePath = imageFolder + `/${image.name}`;
						return supabase.storage
							.from(SUPABASE_IMAGE_BUCKET)
							.upload(imagePath, image);
					})
				);
				if (imageResults.some((res) => res.error !== null)) {
					alert("Error in uploading images, please retry");
					setUploadingChanges(false);
					return;
				}
			}
			await supabase.storage
				.from(SUPABASE_FILES_BUCKET)
				.update(data!.filename!, newFile)
				.then((val) => {
					if (val.error) return;
					return supabase
						.from<Post>(SUPABASE_POST_TABLE)
						.update({
							title: blogData.title,
							description: blogData.description,
							language: blogData.language,
						})
						.eq("id", currPostId);
				})
				.then((val) => {
					setUploadingChanges(false);
					if (val?.error) alert(val.error.message);
					if (val && val.data) {
						setHasMarkdownChanged(false);
						setEditingMarkdown(false);
						if (images) {
							setPrevImages((prev) => [
								...prev,
								...images.map((i) => i.name),
							]);
						}

						setImages([]);
						alert("Changes Uploaded Successfully");
					}
				});
			return;
		}

		const { data: insertPostData, error: insertPostError } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.insert({
				title: blogData?.title,
				description: blogData?.description,
				created_by: user.id,
				language: blogData?.language,
			});

		if (!insertPostData || insertPostError || insertPostData.length === 0) {
			alert(insertPostError?.message || "Could not create post");
			setUploadingChanges(false);
			return;
		}
		const blogFolder = makeFolderName(user.id, insertPostData.at(0)!.id!);
		const filePath = blogFolder + "/file.md";
		const { error: fileUploadError } = await supabase.storage
			.from(SUPABASE_FILES_BUCKET)
			.upload(filePath, newFile);
		if (fileUploadError) {
			alert(fileUploadError.message);
			setUploadingChanges(false);
			return;
		}

		if (canvasImages) {
			Promise.all(
				canvasImages.map((ci) => {
					supabase.storage
						.from(SUPABASE_IMAGE_BUCKET)
						.upload(`${blogFolder}/${ci.name}`, ci);
				})
			).catch((e) => console.log(e));
		}

		if (validImages.length > 0) {
			const imageResults = await Promise.all(
				validImages.map((image) => {
					return supabase.storage
						.from(SUPABASE_IMAGE_BUCKET)
						.upload(`${blogFolder}/${image.name}`, image);
				})
			);
			if (imageResults.some((res) => res.error !== null)) {
				alert("Error in uploading images, please retry");
				setUploadingChanges(false);
				return;
			}
		}

		await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.update({ image_folder: blogFolder, filename: filePath })
			.match({ id: insertPostData.at(0)?.id })
			.then((val) => {
				if (val.error) {
					setUploadingChanges(false);
					alert(val.error.message);
				}

				if (val.data) {
					setCurrPostId(val.data.at(0)?.id);
					setUploadingChanges(false);
					setHasMarkdownChanged(false);
					if (images) {
						setPrevImages((prev) => [
							...prev,
							...images.map((i) => i.name),
						]);
					}

					setImages([]);
					alert("Post Uploaded sucessfully");
				}
			});
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
			<DeleteImagesModal
				imageNames={[...prevImages, ...images.map((i) => i.name)]}
				{...{
					images,
					setImages,
					prevImages,
					setPrevImages,
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
								paddingClasses="px-2 lg:px-20"
							/>
						</div>
						<div
							className={`flex flex-col absolute top-0 left-0 h-full w-full ${
								editingMarkdown ? "" : "invisible"
							}`}
						>
							<div className="flex w-full justify-start md:justify-center gap-1 pb-1 flex-wrap ">
								<div
									className="btn btn-xs tool"
									onClick={() => {
										if (editorView) onBold(editorView);
									}}
								>
									<FaBold />
								</div>
								<div
									className="btn btn-xs tool"
									onClick={() => {
										if (editorView) onItalic(editorView);
									}}
								>
									<FaItalic />
								</div>
								<select
									className="select select-xs tool focus:outline-none"
									onChange={(e) => {
										if (editorView)
											onSelect(
												editorView,
												e.target.value
											);
									}}
								>
									<option disabled selected>
										Heading
									</option>
									<option value="heading2">heading 2</option>
									<option value="heading3">heading 3</option>
									<option value="heading4">heading 4</option>
									<option value="heading5">heading 5</option>
									<option value="heading6">heading 6</option>
								</select>
								<div
									className="btn btn-xs normal-case tool"
									onClick={() => {
										if (editorView) onCodeWord(editorView);
									}}
								>
									Code word
								</div>
								<div
									className="btn btn-xs normal-case tool"
									onClick={() => {
										if (editorView) onCodeBlock(editorView);
									}}
								>
									Code block
								</div>
								<div
									className="btn btn-xs normal-case tool"
									onClick={() => {
										if (editorView) onImage(editorView);
									}}
								>
									Image
								</div>
								<div
									className="btn btn-xs normal-case tool"
									onClick={() => {
										if (editorView)
											onOrdererdList(editorView);
									}}
								>
									{/* <AiOutlineOrderedList size={20} /> */}
									<GoListOrdered size={20} />
									{/* O.L */}
								</div>
								<div
									className="btn btn-xs normal-case tool"
									onClick={() => {
										if (editorView)
											onUnordererdList(editorView);
									}}
								>
									{/* <AiOutlineUnorderedList size={20} /> */}
									<GoListUnordered size={20} />
									{/* U.L */}
								</div>
								<div
									className="btn btn-xs normal-case tool"
									onClick={() => {
										if (editorView)
											onBlockQuote(editorView);
									}}
								>
									BlockQuote
								</div>
								<div
									className="btn btn-xs normal-case tool"
									onClick={() => {
										if (editorView) onLink(editorView);
									}}
								>
									Link
								</div>
								<div
									className="btn btn-xs normal-case tool"
									onClick={() => {
										if (editorView) onLatex(editorView);
									}}
								>
									LaTeX
								</div>
								<div
									className="btn btn-xs normal-case tool"
									onClick={() => {
										if (editorView) onCanvas(editorView);
									}}
								>
									Canvas
								</div>
							</div>
							<div className="grow relative">
								<div
									className={`pb-20 lg:pb-0 overflow-y-auto  w-full `}
									id="markdown-textarea"
									onPaste={() => {
										setCumulativeImageName("");
										setCopiedImageName("");
									}}
								></div>
								<div
									className="absolute top-2 right-2 tooltip tooltip-left"
									data-tip="Enable Vim"
									onClick={() =>
										setEnabledVimForMarkdown(
											(prev) => !prev
										)
									}
								>
									<SiVim
										className={` ${
											enabledVimForMarkdown
												? "text-lime-400"
												: "text-cyan-400"
										}`}
									/>
								</div>
							</div>
						</div>
					</>

					<>
						{blogData.language && (
							<div
								className={` btn btn-circle  btn-ghost tooltip`}
								data-tip={` ${
									user
										? "Enable remote code execution"
										: "Enable remote code execution"
								} `}
								onClick={prepareContainer}
							>
								<BiCodeAlt
									size={30}
									className={` ${
										containerId
											? "text-lime-400"
											: "text-white"
									} mt-2 ml-2 `}
								/>
							</div>
						)}
						<div
							className="btn btn-circle btn-ghost tooltip"
							data-tip={
								editingMarkdown ? "Preview" : "Edit Markdown"
							}
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

						<div
							className="relative w-fit"
							onClick={onNewPostUpload}
						>
							<span
								className={`absolute rounded-full bg-yellow-400 w-2 h-2 right-0 ${
									hasMarkdownChanged ? "" : "hidden"
								} ${uploadingChanges ? "animate-ping" : ""}`}
							></span>
							<div
								className="btn btn-circle btn-ghost tooltip"
								data-tip={
									hasMarkdownChanged
										? `${
												currPostId
													? "Upload Changes"
													: `${
															user
																? "Upload Post"
																: "Save changes Locally"
													  }`
										  }`
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

						<div className="">
							<label
								className="btn btn-circle btn-ghost tooltip"
								data-tip={`Add Image`}
								htmlFor={
									images.length + prevImages.length <
									PHOTO_LIMIT
										? "extra-images"
										: "delete-images"
								}
							>
								<BiImageAdd size={32} className="mt-2 ml-2" />
							</label>

							<input
								type={"file"}
								name=""
								id="extra-images"
								className="hidden"
								accept="image/*"
								multiple
								max={
									PHOTO_LIMIT -
									images.length -
									prevImages.length
								}
								onChange={(e) => {
									setImages((prev) => [
										...prev,
										...Array.from(
											e.target.files || []
										).slice(
											0,
											PHOTO_LIMIT -
												prev.length -
												prevImages.length
										),
									]);
								}}
							/>
						</div>
						<div
							className={`flex flex-col text-white normal-case cursor-pointer 
							${images.length > 0 ? "" : "hidden"} h-20 overflow-y-auto`}
						>
							{images.map((i) => (
								<ImageCopy
									key={i.name}
									name={i.name}
									{...{
										setImages,
										copiedImageName,
										setCopiedImageName,
										cumulativeImageName,
										setCumulativeImageName,
									}}
								/>
							))}
						</div>
					</>
				</BlogLayout>
			</CanvasImageContext.Provider>
			<SmallScreenFooter>
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
					htmlFor={
						images.length + prevImages.length < PHOTO_LIMIT
							? "extra-images"
							: "delete-images"
					}
				>
					<BiImageAdd size={22} className="mt-2 ml-2" />
					<span className="">Add Image</span>
				</label>
				<input
					type="file"
					name=""
					id="extra-images"
					className="hidden"
					accept="image/*"
					multiple
					max={PHOTO_LIMIT - images.length - prevImages.length}
					onChange={(e) => {
						setImages((prev) => [
							...prev,
							...Array.from(e.target.files || []).slice(
								0,
								PHOTO_LIMIT - prev.length - prevImages.length
							),
						]);
					}}
				/>

				{images.length > 0 ? (
					<div
						className={`flex flex-col items-center gap-1 text-white 
						 relative`}
						onClick={(e) => {
							e.preventDefault();
							setShowGallery((prev) => !prev);
						}}
					>
						{showGallery && (
							<div
								className="flex h-32 flex-col gap-2 absolute -top-40 border-0 rounded-md -left-24 w-64 z-50 p-2 overflow-y-auto bg-slate-800"
								onClick={(e) => e.stopPropagation()}
							>
								{images.map((i) => (
									<ImageCopy
										key={i.name}
										name={i.name}
										{...{
											copiedImageName,
											setImages,
											setCopiedImageName,
											cumulativeImageName,
											setCumulativeImageName,
										}}
									/>
								))}
							</div>
						)}
						<FcGallery size={20} className="text-white" />
						<span className=" w-full truncate">Gallery</span>
					</div>
				) : (
					<></>
				)}

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
