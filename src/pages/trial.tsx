import { GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import {
	ALLOWED_LANGUAGES,
	SUPABASE_FILES_BUCKET,
} from "../../utils/constants";
import { getHtmlFromMarkdown } from "../../utils/getResources";
import { supabase } from "../../utils/supabaseClient";
import { Blog } from "../components/Blog";
import Layout from "../components/Layout";
import useEditor from "../hooks/useEditor";
import { UserContext } from "./_app";
import { BiRotateRight } from "react-icons/bi";
import {
	BsArrowRightCircleFill,
	BsFillArrowRightCircleFill,
} from "react-icons/bs";
import { FcSearch } from "react-icons/fc";
import searchGif from "../../public/search.gif";
import writeGif from "../../public/write.gif";
import canvasGif from "../../public/canvas.gif";
// import markdownArray from "../../utils/trialArray";

interface TrialProps {
	markdown: string;
}

function Trial({ markdown }: TrialProps) {
	const { user } = useContext(UserContext);
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);
	const [resizing, setResizing] = useState(false);
	const [editorMockupWidth, setEditorMockupWidth] = useState(750);
	const [markdownChanged, setMarkdownChanged] = useState(false);
	const [convertToHtml, setConvertToHtml] = useState(false);
	const [screen, setScreen] = useState<
		"desktop" | "tablet" | "phone" | "tablet-rotated"
	>("desktop");

	const { editorView } = useEditor({
		language: "markdown",
		editorParentId: "editor-mockup",
		code: markdown,
	});

	const [blogData, setBlogData] = useState<{
		title?: string;
		description?: string;
		language?: typeof ALLOWED_LANGUAGES[number];
		content?: string;
	}>({});

	const updateBlogData = (newMarkdown: string) => {
		getHtmlFromMarkdown(newMarkdown)
			.then(({ data, content }) => {
				setBlogData({
					title: data.title,
					description: data.description,
					language: data.language,
					content,
				});
			})
			.catch((e) => {
				alert(e.message);
			});
	};

	useEffect(() => {
		if (!editorView) return;
		const newMarkdown = editorView?.state.doc.toJSON().join("\n");
		if (!newMarkdown) return;

		updateBlogData(newMarkdown);
	}, [editorView]);

	useEffect(() => {
		if (!editorView || !convertToHtml) return;
		const newMarkdown = editorView?.state.doc.toJSON().join("\n");
		if (!newMarkdown) return;
		updateBlogData(newMarkdown);
		setMarkdownChanged(false);
		setConvertToHtml(false);
	}, [editorView, convertToHtml]);

	return (
		<Layout user={user || null} route={router.asPath}>
			<div className="flex flex-col pb-20 grow overflow-y-auto mt-20">
				<div className="self-center text-center leading-relaxed w-4/5 text-4xl pb-10 text-white font-bold">
					Write posts containing{" "}
					<span className="text-amber-400 trial-1">Prose</span>,{" "}
					<span className="text-cyan-400 trial-2">
						<span className="italic">Executable</span> code snippets
					</span>
					{", "}
					<span className="text-red-400 trial-3">
						Free hand drawings
					</span>
					{", "}
					and <span className="text-lime-400 trial-4">
						Images
					</span>{" "}
					using simple markdown.
				</div>
				<div
					className="flex justify-center items-start overflow-clip h-[500px] px-4 trial-5"
					ref={containerRef}
					onMouseMove={(e) => {
						if (!resizing) return;
						setEditorMockupWidth(e.clientX);
					}}
					onMouseUp={() => {
						setResizing(false);
					}}
				>
					<div
						className="flex flex-col max-h-full gap-2"
						style={{
							width:
								editorMockupWidth +
								(containerRef.current?.offsetLeft || 0),
						}}
					>
						<div
							className="border-2 border-black overflow-y-auto  overflow-x-scroll rounded-md"
							id="editor-mockup"
							onKeyDown={() => {
								if (!markdownChanged) setMarkdownChanged(true);
							}}
						></div>
						<span className="self-center text-white text-sm">
							Try editing in markdown
						</span>
					</div>
					<div
						className="w-1 relative cursor-ew-resize h-full"
						onMouseDown={() => setResizing(true)}
					>
						<div
							className={`absolute top-1/2 -left-3   rounded-full ${
								markdownChanged
									? "animate-pulse text-amber-400"
									: "animate-none text-amber-100"
							} cursor-pointer`}
							onClick={() => {
								if (markdownChanged) setConvertToHtml(true);
							}}
						>
							<BsFillArrowRightCircleFill size={30} />
						</div>
					</div>
					<div
						className="flex flex-col max-h-full gap-2"
						style={{
							width: containerRef.current?.clientWidth
								? containerRef.current.clientWidth -
								  editorMockupWidth +
								  containerRef.current!.offsetLeft
								: editorMockupWidth +
								  (containerRef.current?.offsetLeft || 0),
						}}
					>
						<div className="border-2 border-black overflow-y-auto max-h-full rounded-md select-none">
							<Blog
								key={0}
								content={blogData?.content}
								title={blogData?.title}
								language={blogData?.language}
								description={blogData?.description}
								bloggers={{ name: "You" }}
								image_folder={
									"f2c61fc8-bcdb-46e9-aad2-99c0608cf485/608"
								}
								paddingClasses="px-12"
							/>
						</div>
						<span className="self-center w-fit text-white text-sm">
							Press the{" "}
							<BsArrowRightCircleFill className="inline mx-1 text-amber-400" />{" "}
							button to see the changes
						</span>
					</div>
				</div>

				<div className="flex mt-20 items-center">
					<div className="flex gap-2 items-center text-3xl tracking-wide font-bold text-white mx-auto h-fit">
						<span>
							<span className="text-amber-400">
								Write/Edit Posts
							</span>{" "}
							&{" "}
							<span className="text-cyan-400">Execute code!</span>
						</span>
					</div>
					<div className="flex w-fit border-black border-2 rounded-md mr-4">
						<Image
							src={writeGif.src}
							width={596}
							height={344}
							layout="fixed"
						/>
					</div>
				</div>
				<div className="flex mt-20 items-center">
					<div className="flex w-fit border-black border-2 rounded-md ml-4">
						<Image
							src={canvasGif.src}
							width={604}
							height={396}
							layout="fixed"
						/>
					</div>
					<div className="flex gap-2 items-center text-3xl tracking-wide font-bold text-white mx-auto h-fit">
						<span>
							Draw{" "}
							<span className="text-red-400">
								Free Hand Diagrams!{" "}
							</span>
						</span>
					</div>
				</div>
				<div className="mt-20 flex mb-10 flex-col items-center gap-2 grow-0 justify-center font-bold text-3xl text-white">
					<span>
						<span className="text-violet-500">Responsive! </span>
						Your posts look good on any device.
					</span>
					<span className="text-sm">
						{" "}
						(Ok, maybe not on an apple watch)
					</span>
					<div className="flex gap-4 text-base mt-5">
						<span
							className={`${
								screen === "desktop"
									? "underline decoration-amber-400"
									: ""
							}`}
							onClick={() => setScreen("desktop")}
						>
							Desktop
						</span>
						<span
							className={`${
								screen === "tablet"
									? "underline decoration-amber-400"
									: ""
							}`}
							onClick={() => setScreen("tablet")}
						>
							tablet
						</span>
						<span
							className={`${
								screen === "tablet-rotated"
									? "underline decoration-amber-400"
									: ""
							} rotate-90`}
							onClick={() => setScreen("tablet-rotated")}
						>
							tablet
						</span>
						<span
							className={`${
								screen === "phone"
									? "underline decoration-amber-400"
									: ""
							}`}
							onClick={() => setScreen("phone")}
						>
							phone
						</span>
					</div>
				</div>
				<div className="w-full flex justify-center">
					<div
						className={`${screen}  
							 transition-all duration-1000 bg-gradient-to-b border-black shadow-black shadow-lg border-4 rounded-lg from-slate-900 via-slate-800 to-slate-700`}
					>
						<iframe
							src="https://rce-blog.xyz/posts/597"
							className="h-full w-full"
						></iframe>
						{/* <Blog
										key={1}
										content={blogData?.content}
										title={blogData?.title}
										language={blogData?.language}
										description={blogData?.description}
										bloggers={{ name: "You" }}
										image_folder={
											"f2c61fc8-bcdb-46e9-aad2-99c0608cf485/597"
										}
										paddingClasses="-rotate-90"
									/> */}
					</div>
				</div>
				<div className="flex mt-20 items-center">
					<div className="w-fit border-black border-2 rounded-md ml-10">
						<Image
							src={searchGif.src}
							width={651}
							height={374}
							layout="fixed"
						/>
					</div>
					<div className="flex gap-2 items-center text-3xl font-bold text-white mx-auto h-fit">
						<FcSearch />
						<span>
							Search through all the posts to find what you need
						</span>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps<TrialProps> = async ({}) => {
	const { data: fileData, error: fileError } = await supabase.storage
		.from(SUPABASE_FILES_BUCKET)
		.download("f2c61fc8-bcdb-46e9-aad2-99c0608cf485/608/file.md");

	if (fileError || !fileData)
		return { props: { markdown: "" }, redirect: "/" };
	const content = await fileData.text();
	return {
		props: {
			markdown: content,
		},
	};
};

export default Trial;
