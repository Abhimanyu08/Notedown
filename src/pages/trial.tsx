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
import { BsFillArrowRightCircleFill } from "react-icons/bs";
import { FcSearch } from "react-icons/fc";
import searchGif from "../../public/search.gif";
import writeGif from "../../public/write.gif";
import canvasGif from "../../public/canvas.gif";

interface TrialProps {
	markdown: string;
}

function Trial({ markdown }: TrialProps) {
	const { user } = useContext(UserContext);
	const router = useRouter();
	const [mockupMarkdown, setMockupMarkdown] = useState(markdown);
	const markdownRef = useRef<HTMLDivElement>(null);
	const blogRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [resizing, setResizing] = useState(false);
	const [editorMockupWidth, setEditorMockupWidth] = useState(700);
	const [rotate, setRotate] = useState(false);
	const [markdownChanged, setMarkdownChanged] = useState(false);
	const [convertToHtml, setConvertToHtml] = useState(true);

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

	const updateBlogData = (markdown: string) => {
		getHtmlFromMarkdown(markdown)
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
		const markdown = editorView?.state.doc.toJSON().join("\n");
		if (!markdown) return;
		updateBlogData(markdown);
	}, [editorView]);

	useEffect(() => {
		if (!editorView || !convertToHtml) return;
		const markdown = editorView?.state.doc.toJSON().join("\n");
		if (!markdown) return;
		updateBlogData(markdown);
		setMarkdownChanged(false);
		setConvertToHtml(false);
	}, [editorView, convertToHtml]);

	return (
		<Layout user={user || null} route={router.asPath}>
			<div className="flex flex-col pb-20 ">
				<div className="self-center text-center leading-relaxed w-4/5 text-4xl py-10 text-white font-bold">
					Write posts containing{" "}
					<span className="text-amber-400">Prose</span>,{" "}
					<span className="text-cyan-400">
						<span className="italic">Executable</span> code
						snippets,
					</span>{" "}
					<span className="text-red-400">Free hand drawings,</span>{" "}
					and <span className="text-lime-400">Images</span> using
					simple markdown.
				</div>
				<div
					className="flex justify-center items-start mockup min-h-0 overflow-clip h-[428px] px-4"
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
						className="border-2 border-black overflow-y-auto max-h-full overflow-x-scroll rounded-md"
						id="editor-mockup"
						ref={markdownRef}
						style={{
							width:
								editorMockupWidth +
								(containerRef.current?.offsetLeft || 0),
						}}
						onKeyDown={() => setMarkdownChanged(true)}
					></div>
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
						className="border-2 border-black overflow-y-auto max-h-full rounded-md select-none"
						ref={blogRef}
						style={{
							width: containerRef.current?.clientWidth
								? containerRef.current.clientWidth -
								  editorMockupWidth +
								  containerRef.current!.offsetLeft
								: editorMockupWidth +
								  (containerRef.current?.offsetLeft || 0),
						}}
					>
						<Blog
							key={0}
							content={blogData?.content}
							title={blogData?.title}
							language={blogData?.language}
							description={blogData?.description}
							bloggers={{ name: "You" }}
							image_folder={
								"f2c61fc8-bcdb-46e9-aad2-99c0608cf485/597"
							}
							paddingClasses="px-4"
						/>
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
					<div className="w-fit border-black border-2 rounded-md mr-4">
						<Image
							src={writeGif.src}
							width={596}
							height={344}
							layout="fixed"
						/>
					</div>
				</div>
				<div className="flex mt-20 items-center">
					<div className="w-fit border-black border-2 rounded-md ml-4">
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
				<div className="flex mt-20">
					<div className="flex flex-col items-center gap-2 justify-center w-1/2 font-bold text-3xl text-white">
						<span>
							<span className="text-violet-500">
								Responsive!{" "}
							</span>
							Your posts look good on any device.
						</span>
						<span className="text-sm">
							{" "}
							(Ok, maybe not on an apple watch)
						</span>
						<div
							className="rounded-full bg-black text-white animate-pulse"
							onClick={() => setRotate((prev) => !prev)}
						>
							<BiRotateRight size={32} />
						</div>
					</div>
					<div className="w-1/2 relative">
						<div
							className={` mockup-phone  absolute top-0 left-40 ${
								rotate ? "opacity-100 rotate-90" : "opacity-0"
							} transition-all duration-1000`}
						>
							<div className="camera"></div>
							<div className="display">
								<div className="artboard artboard-demo  phone-3  bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700">
									<Blog
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
									/>
								</div>
							</div>
						</div>
						<div
							className={` mockup-phone ${
								rotate ? "opacity-0 " : "opacity-100"
							} transition-opacity duration-1000 ml-40`}
						>
							<div className="camera"></div>
							<div className="display">
								<div className="artboard artboard-demo phone-3 pt-10 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700">
									<Blog
										key={2}
										content={blogData?.content}
										title={blogData?.title}
										language={blogData?.language}
										description={blogData?.description}
										bloggers={{ name: "You" }}
										image_folder={
											"f2c61fc8-bcdb-46e9-aad2-99c0608cf485/597"
										}
										paddingClasses="px-4"
									/>
								</div>
							</div>
						</div>
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
		.download("f2c61fc8-bcdb-46e9-aad2-99c0608cf485/597/file.md");

	if (fileError || !fileData)
		return { props: { markdown: "" }, redirect: "/" };
	const content = await fileData.text();
	console.log(content);
	return {
		props: {
			markdown: content,
		},
	};
};

export default Trial;
