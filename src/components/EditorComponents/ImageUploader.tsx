"use client";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { EditorContext } from "@/app/write/components/EditorContext";
import { processImageName } from "@utils/makeFolderName";
import React, {
	ChangeEventHandler,
	useContext,
	useEffect,
	useState,
} from "react";
import { MdContentCopy } from "react-icons/md";
import { BiCheck } from "react-icons/bi";
import { cn } from "@/lib/utils";

function ImageUploader({
	className,
	end,
}: {
	end?: number;
	className?: string;
}) {
	// const { dispatch } = useContext(BlogContext);
	const { editorState, dispatch } = useContext(EditorContext);
	const [fileNames, setFileNames] = useState<string[]>([]);
	const [copied, setCopied] = useState(false);
	useEffect(() => {}, [fileNames]);

	const onImageSelect: ChangeEventHandler<HTMLInputElement> = (e) => {
		const [imagesObj, fileNamesToAdd] = getImagesObj(e);
		const { editorView, frontMatterLength } = editorState;
		if (!editorView) return;
		if (fileNamesToAdd.length === 0) return;
		if (!end) return;
		const imageNames = fileNamesToAdd.join(",");
		// const transaction = view.state.update({changes: {from: cursorPos, to:imageNames.length, inser}})
		editorState.editorView?.dispatch({
			changes: {
				from: end + frontMatterLength - 1,
				insert: imageNames,
			},
		});
		setFileNames(fileNamesToAdd);
		dispatch({
			type: "set image to files",
			payload: imagesObj,
		});
	};

	return (
		<div
			className={cn(
				"flex w-full justify-center py-1 items-center my-10 border-t-[1px] border-b-[1px] border-border",
				className
			)}
		>
			<input
				type="file"
				onChange={onImageSelect}
				// id="gallery-input"
				accept="image/*"
				className="file:my-2  file:px-4 file:text-gray-400 file:rounded-md file:bg-black file:border-[1px] file:border-gray-200 file:hover:bg-gray-800 file:active:scale-95"
				multiple
			/>
			{fileNames.length > 0 && (
				<button
					className="bg-black hover:bg-gray-900 active:scale-95 text-gray-100 w-fit px-3 py-1 rounded-md no-scale tooltip"
					data-tip="Copy image names"
					onClick={() => {
						navigator.clipboard
							.writeText(fileNames.join(","))
							.then(() => {
								setCopied(true);
								setTimeout(() => setCopied(false), 2000);
							});
					}}
				>
					{copied ? (
						<BiCheck size={20} className="text-gray-100" />
					) : (
						<MdContentCopy size={20} />
					)}
				</button>
			)}
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
