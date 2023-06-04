"use client";
import { EditorContext } from "@/app/appwrite/components/EditorContext";
import MarkdownEditor from "@/app/appwrite/components/MarkdownEditor";
import React, { useContext, useState, useEffect, useTransition } from "react";
import AboutJsxWrapper from "./AboutJsxWrapper";
import mdToHtml from "@utils/mdToHtml";
import { AiFillEdit } from "react-icons/ai";
import { BiCheck, BiShow } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { VscLoading } from "react-icons/vsc";
import { useSupabase } from "@/app/appContext";
import { usePathname } from "next/navigation";
import useShortCut from "@/hooks/useShortcut";

function AboutEditor({
	aboutMarkdown,
	aboutHtml,
	changeAbout,
}: {
	aboutMarkdown: string;
	aboutHtml: string;
	changeAbout: (about: string) => Promise<void>;
}) {
	const [html, setHtml] = useState(aboutHtml);
	const [editAbout, setEditAbout] = useState(false);
	const { editorState, dispatch } = useContext(EditorContext);
	const [isPending, startTransition] = useTransition();
	const { session } = useSupabase();
	const pathname = usePathname();

	useEffect(() => {
		if (!editorState.editingMarkdown && editorState.editorView) {
			const markdown = editorState.editorView.state.sliceDoc();
			mdToHtml(markdown).then((val) => setHtml(val));
		}
	}, [editorState.editingMarkdown]);

	useShortCut({
		keys: ["Alt", "p"],
		callback: () => {
			dispatch({ type: "toggle markdown editor", payload: null });
		},
	});

	if (pathname?.split("/").at(2) !== session?.user.id) {
		return <></>;
	}

	return (
		<>
			{editAbout ? (
				<div className="flex absolute top-2 right-2 gap-2">
					<button
						className="dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom"
						data-tip={
							editorState.editingMarkdown
								? "preview (Alt + p)"
								: "edit (Alt + p)"
						}
						onClick={() =>
							dispatch({
								type: "toggle markdown editor",
								payload: null,
							})
						}
					>
						{editorState.editingMarkdown ? (
							<BiShow size={14} />
						) : (
							<AiFillEdit size={14} />
						)}
					</button>
					{/* <button className="tooltip tooltip-bottom" data-tip="save">
					</button> */}
					<button
						className="dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom"
						data-tip="Save"
						onClick={() => {
							startTransition(() =>
								changeAbout(
									editorState.editorView?.state.sliceDoc() ||
										""
								).then(() => {
									setEditAbout(false);
									if (!editorState.editingMarkdown) {
										dispatch({
											type: "toggle markdown editor",
											payload: null,
										});
									}
								})
							);
						}}
					>
						{isPending ? (
							<VscLoading className="animate-spin" />
						) : (
							<BiCheck size={14} />
						)}
					</button>
					<button
						className="dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom"
						data-tip="close"
						onClick={() => setEditAbout(false)}
					>
						<IoMdClose />
					</button>
				</div>
			) : (
				<button
					className="absolute top-2 right-2 dark:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom"
					data-tip="edit"
					onClick={() => setEditAbout((prev) => !prev)}
				>
					<AiFillEdit size={14} />
				</button>
			)}

			{editAbout && (
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
