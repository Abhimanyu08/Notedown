import React, { useEffect, useRef, useState } from "react";
import {
	BsFillArrowRightCircleFill,
	BsArrowRightCircleFill,
} from "react-icons/bs";
import { ALLOWED_LANGUAGES } from "../../../utils/constants";
import { getHtmlFromMarkdown } from "../../../utils/getResources";
import useEditor from "../../hooks/useEditor";
import { Blog } from "../Blog";

function MdToBlog({ markdown }: { markdown: string }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [resizing, setResizing] = useState(false);
	const [editorMockupWidth, setEditorMockupWidth] = useState(750);
	const [markdownChanged, setMarkdownChanged] = useState(false);
	const [convertToHtml, setConvertToHtml] = useState(false);
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
					className="border-2 border-black overflow-y-auto  overflow-x-scroll rounded-md drop-shadow-lg"
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
					className={`absolute top-1/2 -left-3 z-10  rounded-full ${
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
				<div className="border-2 border-black overflow-y-auto max-h-full rounded-md select-none bg-slate-900 drop-shadow-xl">
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
	);
}

export default MdToBlog;
