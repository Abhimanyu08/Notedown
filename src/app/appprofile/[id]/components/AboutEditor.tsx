"use client";
import { EditorContext } from "@/app/appwrite/components/EditorContext";
import MarkdownEditor from "@/app/appwrite/components/MarkdownEditor";
import React, { useContext, useState, useEffect } from "react";
import AboutJsxWrapper from "./AboutJsxWrapper";
import mdToHtml from "@utils/mdToHtml";
import { AiFillEdit } from "react-icons/ai";

function AboutEditor({
	aboutMarkdown,
	aboutHtml,
}: {
	aboutMarkdown: string;
	aboutHtml: string;
}) {
	const [html, setHtml] = useState(aboutHtml);
	const [show, setShow] = useState(false);
	const { editorState } = useContext(EditorContext);

	useEffect(() => {
		if (!editorState.editingMarkdown && editorState.editorView) {
			const markdown = editorState.editorView.state.sliceDoc();
			mdToHtml(markdown).then((val) => setHtml(val));
		}
	}, [editorState.editingMarkdown]);

	return (
		<>
			<button
				className="absolute top-2 right-2"
				onClick={() => setShow((prev) => !prev)}
			>
				<AiFillEdit />
			</button>
			{show && (
				<div className="absolute top-20 left-0 bg-black z-20 w-full grow">
					<div
						className={` ${
							editorState.editingMarkdown ? "" : "hidden"
						}`}
					>
						<MarkdownEditor initialMarkdown={aboutMarkdown} />
					</div>

					<div
						className={`${
							editorState.editingMarkdown ? "hidden" : "grow"
						}`}
					>
						<AboutJsxWrapper html={html} />
					</div>
				</div>
			)}
		</>
	);
}

export default AboutEditor;
