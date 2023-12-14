"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { cn } from "@/lib/utils";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { processImageName } from "@utils/makeFolderName";
import React, { useCallback, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { BiImageAdd } from "react-icons/bi";

function ImageUploader({
	className,
	end,
	add = false,
}: {
	end?: number;
	className?: string;
	add?: boolean;
}) {
	// const { dispatch } = useContext(BlogContext);
	const { editorState, dispatch } = useContext(EditorContext);
	const { documentDb } = useContext(IndexedDbContext);
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			// Do something with the files
			if (!editorState || !documentDb) return;
			if (acceptedFiles.length === 0) return;
			const imagesMap: Record<string, File> = {};
			for (let file of acceptedFiles) {
				imagesMap[file.name] = file;
			}
			const { editorView, frontMatterLength } = editorState;
			if (!editorView) return;
			if (!end) return;
			dispatch({
				type: "add image to files",
				payload: imagesMap,
			});
			for (let [imageName, imageFile] of Object.entries(imagesMap)) {
				const imageBlob = imageFile;
				let objectStore = documentDb!
					.transaction("images", "readwrite")
					.objectStore("images");

				const newData = {
					imageName,
					imageBlob,
				};

				objectStore.put(newData);
			}
			editorState.editorView?.focus();
			// if we are adding to already uploaded images then we need to put a comma in front.
			const imageNames = Object.keys(imagesMap).join(",");
			const toInsert = add ? "," + imageNames : imageNames;
			editorState.editorView?.dispatch({
				changes: {
					from: end + frontMatterLength - 1,
					insert: toInsert,
				},
			});
		},
		[documentDb, editorState]
	);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
	});

	if (add) {
		return (
			<div {...getRootProps()} className="self-end ">
				<input
					type="file"
					id={`add-images-${end}`}
					accept="image/*"
					className="hidden"
					multiple
					{...getInputProps()}
				/>
				<Button
					className={cn(
						"text-sm bg-black py-1 px-2  border-border border-[1px] mb-2 text-gray-400 hover:text-white hover:scale-100",
						isDragActive && "bg-secondary"
					)}
					variant={"outline"}
				>
					{/* <Button className="border-border border-[1px] text-gray-400 hover:text-white hover:scale-100"> */}
					<label
						htmlFor={`add-images-${end}`}
						className="flex items-center gap-2"
					>
						<BiImageAdd size={12} />
						<span>Add Images</span>
					</label>
					{/* </Button> */}
				</Button>
			</div>
		);
	}
	return (
		<div
			className={cn(
				"flex w-full justify-center py-10 items-center my-10 border-t-[1px] border-b-[1px] border-border",
				className,
				isDragActive && "bg-secondary"
			)}
			{...getRootProps()}
		>
			<Input
				type="file"
				// id="gallery-input"
				accept="image/*"
				className="hidden"
				id={`upload-images-${end}`}
				multiple
				{...getInputProps()}
			/>
			<Button
				className="text-sm bg-black self-end border-border border-[1px] mb-2 text-gray-400 hover:text-white hover:scale-100"
				variant={"outline"}
				size={"lg"}
			>
				{/* <Button className="border-border border-[1px] text-gray-400 hover:text-white hover:scale-100"> */}
				<label
					className="flex items-center gap-2"
					htmlFor={`upload-images-${end}`}
				>
					<BiImageAdd size={12} />
					<span>Upload / Drag Images</span>
				</label>
				{/* </Button> */}
			</Button>
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
	return [obj, fileNames] as const;
};
export default ImageUploader;
