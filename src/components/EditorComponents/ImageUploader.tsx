"use client";
import { BlogContext } from "@/app/post/components/BlogState";
import { EditorContext } from "@/app/write/components/EditorContext";
import { processImageName } from "@utils/makeFolderName";
import React, { useContext, useEffect, useState } from "react";

function ImageUploader() {
	const { blogState, dispatch } = useContext(BlogContext);
	const { editorState } = useContext(EditorContext);
	const [fileNames, setFileNames] = useState<string[]>([]);
	useEffect(() => {
		if (!editorState.editorView) return;
		if (fileNames.length === 0) return;
		const view = editorState.editorView;
		const imageNames = fileNames.join(",");
		const cursorPos = view.state.selection.ranges[0].from;
		// const transaction = view.state.update({changes: {from: cursorPos, to:imageNames.length, inser}})
		editorState.editorView?.dispatch({
			changes: {
				from: cursorPos,
				insert: imageNames,
			},
		});
	}, [fileNames]);

	return (
		<div className="flex w-full justify-center py-1">
			<input
				type="file"
				onChange={(e) => {
					const imagesObj = getImagesObj(e);
					setFileNames(Object.keys(imagesObj));
					dispatch({
						type: "set image to files",
						payload: imagesObj,
					});
				}}
				max={6}
				// id="gallery-input"
				accept="image/*"
				className="file:my-2  file:px-4 file:text-white file:rounded-md file:bg-black file:border-[1px] file:border-white file:hover:bg-gray-800 file:active:scale-95"
				multiple
			/>
		</div>
	);
}

const getImagesObj = (e: React.ChangeEvent<HTMLInputElement>) => {
	if (!e.currentTarget.files) return {};
	const obj: Record<string, File> = {};
	Array.from(e.currentTarget.files).map((file) => {
		let fileName = file.name;
		fileName = processImageName(fileName);

		obj[fileName] = file;
	});
	return obj;
};
export default ImageUploader;
