"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import { cn } from "@/lib/utils";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { processImageName } from "@utils/makeFolderName";
import React, { ChangeEventHandler, useContext } from "react";
import { BiImageAdd } from "react-icons/bi";
import { Input } from "@components/ui/input";

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

	const onImageSelect: ChangeEventHandler<HTMLInputElement> = async (e) => {
		const [imagesObj, fileNamesToAdd] = getImagesObj(e);
		const { editorView, frontMatterLength } = editorState;
		if (!editorView) return;
		if (fileNamesToAdd.length === 0) return;
		if (!end) return;
		const imageNames = fileNamesToAdd.join(",");
		dispatch({
			type: "add image to files",
			payload: imagesObj,
		});
		for (let [imageName, imageFile] of Object.entries(imagesObj)) {
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
		const toInsert = add ? "," + imageNames : imageNames;
		editorState.editorView?.dispatch({
			changes: {
				from: end + frontMatterLength - 1,
				insert: toInsert,
			},
		});
	};

	if (add) {
		return (
			<>
				<input
					type="file"
					onChange={onImageSelect}
					id={`add-images-${end}`}
					accept="image/*"
					className="hidden"
					multiple
				/>
				<Button
					className="text-sm bg-black py-1 px-2  self-end border-border border-[1px] mb-2 text-gray-400 hover:text-white hover:scale-100"
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
			</>
		);
	}
	return (
		<div
			className={cn(
				"flex w-full justify-center py-10 items-center my-10 border-t-[1px] border-b-[1px] border-border",
				className
			)}
		>
			<Input
				type="file"
				onChange={onImageSelect}
				// id="gallery-input"
				accept="image/*"
				className="hidden"
				id={`upload-images-${end}`}
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
					<span>Upload Images</span>
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
