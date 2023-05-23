"use client";
import { BlogContext } from "@/app/apppost/components/BlogState";
import ToolbarButton from "@/app/apppost/components/ToolbarButton";
import ImageWithCaption from "@components/BlogPostComponents/ImageWithCaption";
import { processImageName } from "@utils/makeFolderName";
import Image from "next/image";
import React, { memo, useContext, useState } from "react";
import { BiImageAdd } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
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
			<input
				type="checkbox"
				name=""
				id="gallery"
				className="hidden modal-input"
			/>
			<label
				htmlFor="gallery"
				className="absolute top-0 left-0 w-full h-full z-10 text-white modal-box"
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
							className="w-full h-full group flex flex-col items-center justify-center p-auto hover:bg-gray-800 aspect-square"
						>
							<BiImageAdd
								size={40}
								className="group-hover:scale-105 group-active:scale-95"
							/>
						</label>
					</div>
				</label>
				<div
					className={`flex self-center w-3/4 ${
						namesToCopy.length > 0 ? "visible" : "invisible"
					}`}
				>
					<p className="grow overflow-x-auto border-b-[1px] border-white">
						{namesToCopy.join(",") || "hello"}
					</p>

					<label
						onClick={() => {
							navigator.clipboard.writeText(
								namesToCopy.join(",")
							);
						}}
						htmlFor="gallery"
						data-tip="Copy"
						className="flex items-center gap-1 text-sm group"
					>
						<MdContentCopy className="group-hover:scale-110 group-active:scale-90" />
						<span>copy</span>
					</label>
				</div>
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
		fileName = processImageName(fileName);

		obj[fileName] = file;
	});
	return obj;
};

export default GalleryModal;
