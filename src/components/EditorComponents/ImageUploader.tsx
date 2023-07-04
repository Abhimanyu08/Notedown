"use client";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { EditorContext } from "@/app/write/components/EditorContext";
import { processImageName } from "@utils/makeFolderName";
import React, { useContext, useEffect, useState } from "react";

function ImageUploader() {
	// const { dispatch } = useContext(BlogContext);
	const { editorState, dispatch } = useContext(EditorContext);
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
					const [imagesObj, fileNamesToAdd] = getImagesObj(e);
					setFileNames(fileNamesToAdd);
					dispatch({
						type: "set image to files",
						payload: imagesObj,
					});
				}}
				// id="gallery-input"
				accept="image/*"
				className="file:my-2  file:px-4 file:text-gray-100 file:bg-black file:border-[1px] file:border-gray-200 file:hover:bg-gray-800 file:active:scale-95"
				multiple
			/>
		</div>
	);
}

const getImagesObj = (e: React.ChangeEvent<HTMLInputElement>) => {
	if (!e.currentTarget.files) return [];
	const obj: Record<string, File> = {};
	const fileNames: string[] = [];
	for (let i = 0; i < e.currentTarget.files.length; i++) {
		const file = e.currentTarget.files.item(i)!;
		let fileName = file.name;
		fileName = processImageName(fileName);
		fileNames.push(fileName);

		obj[fileName] = file;
	}
	console.log(fileNames);
	return [obj, fileNames] as const;
};
export default ImageUploader;
