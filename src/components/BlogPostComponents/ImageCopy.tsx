import React, { Dispatch, SetStateAction } from "react";
import { AiFillDelete, AiFillPlusCircle } from "react-icons/ai";
import { BsCheck2 } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";

function ImageCopy({
	name,
	copiedImageName,
	setCopiedImageName,
	setImages,
	cumulativeImageName,
	setCumulativeImageName,
}: {
	name: string;
	cumulativeImageName: string;
	setCumulativeImageName: Dispatch<SetStateAction<string>>;
	copiedImageName: string;
	setCopiedImageName: Dispatch<SetStateAction<string>>;
	setImages: Dispatch<SetStateAction<File[]>>;
}) {
	return (
		<div className="w-full select-all flex items-center lg:items-end gap-2 lg:border-l-2 lg:pl-1 lg:py-1">
			<span className="w-2/3 break-words select-all text-sm overflow-auto">
				{name}
			</span>
			<div
				className="lg:btn-ghost btn btn-xs"
				onClick={() => {
					navigator.clipboard.writeText(name).then(() => {
						setCopiedImageName(name);
					});
				}}
			>
				{copiedImageName && copiedImageName === name ? (
					<BsCheck2 className="text-white" />
				) : (
					<FiCopy className="text-white" />
				)}
			</div>
			<div
				className="btn btn-xs"
				onClick={() => {
					const newName =
						cumulativeImageName !== ""
							? cumulativeImageName + `,${name}`
							: name;
					navigator.clipboard.writeText(newName).then(() => {
						setCumulativeImageName(newName);
					});
				}}
			>
				{cumulativeImageName.split(",").some((n) => n === name) ? (
					<BsCheck2 className="text-white" />
				) : (
					<AiFillPlusCircle className="text-white" />
				)}
			</div>
			<div
				className="btn btn-xs"
				onClick={() =>
					setImages((prev) => prev.filter((im) => im.name !== name))
				}
			>
				<AiFillDelete className="text-white" />
			</div>
		</div>
	);
}

export default ImageCopy;
