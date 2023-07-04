"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import MarkdownEditor from "@/app/write/components/MarkdownEditor";
import useOwner from "@/hooks/useOwner";
import useShortCut from "@/hooks/useShortcut";
import mdToHtml from "@utils/mdToHtml";
import { useContext, useEffect, useState, useTransition } from "react";
import { AiFillEdit } from "react-icons/ai";
import { BiCheck, BiShow } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { VscLoading } from "react-icons/vsc";
import AboutJsxWrapper from "./AboutJsxWrapper";

function AboutEditor({
	name,
	aboutMarkdown,
	aboutHtml,
	changeAbout,
}: {
	name: string;
	aboutMarkdown: string;
	aboutHtml: string;
	changeAbout: (name: string, about: string) => Promise<void>;
}) {
	const [html, setHtml] = useState(aboutHtml);
	const [newName, setNewName] = useState(name);
	const [editAbout, setEditAbout] = useState(false);
	const { editorState, dispatch } = useContext(EditorContext);
	const [isPending, startTransition] = useTransition();
	const owner = useOwner();

	useEffect(() => {
		if (!editorState.editingMarkdown && editorState.editorView) {
			const markdown = editorState.editorView.state.sliceDoc();
			setHtml(mdToHtml(markdown));
		}
	}, [editorState.editingMarkdown]);

	useShortCut({
		keys: ["Alt", "p"],
		callback: () => {
			dispatch({ type: "toggle markdown editor", payload: null });
		},
	});

	if (!owner) {
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
									newName || name,
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
						onClick={() => {
							if (!editorState.editingMarkdown) {
								dispatch({
									type: "toggle markdown editor",
									payload: null,
								});
							}
							setEditAbout(false);
						}}
					>
						<IoMdClose />
					</button>
				</div>
			) : (
				<button
					className="absolute top-2 right-2 dark:hover:bg-gray-800 p-2 rounded-full tooltip tooltip-bottom"
					data-tip="edit"
					onClick={() => setEditAbout((prev) => !prev)}
				>
					<AiFillEdit size={14} />
				</button>
			)}

			{editAbout && (
				<div className="w-[500px] absolute top-0 left-0">
					{editorState.editingMarkdown ? (
						<input
							type="text"
							className="h-10 bg-black placeholder:text-white text-white border-[1px] border-gray-800  w-60 px-2 focus:placeholder:invisible focus:border-gray-300 top-1 left-1 absolute"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
						/>
					) : (
						<h1 className="text-3xl tracking-normal mb-10 bg-black pl-1">
							{newName}
						</h1>
					)}
				</div>
			)}

			{editAbout && (
				<div className="absolute top-20 left-0 bg-black z-20 w-full h-[580px]">
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
