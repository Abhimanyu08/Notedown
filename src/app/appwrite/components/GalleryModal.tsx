"use client";
import { BlogContext } from "@/app/apppost/components/BlogState";
import ImageWithCaption from "@components/BlogPostComponents/ImageWithCaption";
import Image from "next/image";
import React, { memo, useContext, useState } from "react";
import { MdContentCopy } from "react-icons/md";

function GalleryModal() {
	const { blogState, dispatch } = useContext(BlogContext);
	const [namesToCopy, setNamesToCopy] = useState<string[]>([]);
	return (
		<>
			<input
				type="file"
				onChange={(e) => {
					dispatch({
						type: "set image to files",
						payload: getImagesObj(e),
					});
				}}
				id="gallery-input"
				accept="image/*"
				className="hidden"
				multiple
			/>
			<input type="checkbox" name="" id="gallery" className="hidden" />
			<label
				htmlFor="gallery"
				className="absolute top-0 left-0 w-full h-full z-10 text-white"
			>
				<label className="w-3/4 h-3/4 bg-black border-[1px] border-white overflow-auto">
					<div className="grid grid-cols-3 w-full  auto-rows-max">
						{Object.entries(blogState.imagesToFiles).map(
							(entry) => {
								const [imageName, imageFile] = entry;
								return (
									<div className="col-span-1 flex items-center relative group">
										<GridObject
											{...{ imageName, imageFile }}
											onCheck={(e) => {
												if (e.target.checked)
													setNamesToCopy((prev) => [
														...prev,
														imageName,
													]);
												else {
													setNamesToCopy((prev) =>
														prev.filter(
															(i) =>
																i !== imageName
														)
													);
												}
											}}
											checked={namesToCopy.includes(
												imageName
											)}
										/>
									</div>
								);
							}
						)}
						<label
							htmlFor="gallery-input"
							className="w-full h-full text-center p-auto hover:bg-gray-800 aspect-square"
						>
							Add images
						</label>
					</div>
				</label>
				{namesToCopy.length > 0 && (
					<div className="flex w-3/4">
						<p className="grow overflow-x-auto border-b-[1px] border-white">
							{namesToCopy.join(",")}
						</p>
						<label
							onClick={() => {
								navigator.clipboard.writeText(
									namesToCopy.join(",")
								);
							}}
							htmlFor="gallery"
						>
							<MdContentCopy />
						</label>
					</div>
				)}
			</label>
		</>
	);
}

const GridObject = memo(
	function GridObject({
		imageName,
		imageFile,
		onCheck,
		checked,
	}: {
		imageName: string;
		imageFile: File;
		onCheck: React.ChangeEventHandler<HTMLInputElement>;
		checked: boolean;
	}) {
		return (
			<>
				<Image
					src={window.URL.createObjectURL(imageFile) || ""}
					alt={imageName}
					width={1440}
					height={1080}
				/>
				<div
					className={`w-full h-full bg-black/50 absolute top-0 left-0  flex items-center justify-center 
			${checked ? "" : "opacity-0 bg group-hover:opacity-100"}`}
				>
					<input
						type="checkbox"
						name=""
						id=""
						className="w-4 h-6"
						onChange={onCheck}
					/>
				</div>
			</>
		);
	},
	(prevProps, nextProps) => prevProps.checked === nextProps.checked
);

const getImagesObj = (e: React.ChangeEvent<HTMLInputElement>) => {
	if (!e.currentTarget.files) return {};
	const obj: Record<string, File> = {};
	Array.from(e.currentTarget.files).map((file) => {
		let fileName = file.name;
		fileName = fileName
			.split(" ")
			.map((i) => i.toLowerCase())
			.join("");

		obj[fileName] = file;
	});
	return obj;
};

export default GalleryModal;
