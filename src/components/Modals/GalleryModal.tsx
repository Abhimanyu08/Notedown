import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AiFillCloseCircle, AiFillDelete } from "react-icons/ai";
import { MdOutlineContentCopy } from "react-icons/md";
import { CAROUSEL_LIMIT, PHOTO_LIMIT } from "../../../utils/constants";
import { BiImageAdd } from "react-icons/bi";
import { RiArrowGoBackFill } from "react-icons/ri";
import { processImageName } from "../../../utils/makeFolderName";

interface GalleryModalProps {
	currImages: string[];
	prevImages: string[];
	imageToUrl: Record<string, string>;
	setImages: React.Dispatch<React.SetStateAction<File[]>>;
	toBeDeletedFromStorage: string[];
	setToBeDeletedFromStorage: React.Dispatch<React.SetStateAction<string[]>>;
}

function GalleryModal({
	currImages,
	prevImages,
	imageToUrl,
	setImages,
	toBeDeletedFromStorage,
	setToBeDeletedFromStorage,
}: GalleryModalProps) {
	const [show, setShow] = useState(false);
	const [selectedObj, setSelectedObj] = useState<Record<string, boolean>>({});
	const [toBeCopied, setToBeCopied] = useState<string[]>([]);
	const [imageAge, setImageAge] = useState<"new" | "old">("new");

	useEffect(() => {
		if (!currImages) return;

		const imageToSelected: typeof selectedObj = {};
		Object.keys(currImages).forEach((imageName) => {
			if (Object.hasOwn(selectedObj, imageName)) return;
			imageToSelected[imageName] = false;
		});
		setSelectedObj((prev) => ({ ...prev, ...imageToSelected }));
	}, [currImages]);

	useEffect(() => {
		if (toBeCopied.length === 0 && currImages) {
			const imageToSelected: typeof selectedObj = {};
			Object.keys(currImages).forEach((imageName) => {
				imageToSelected[imageName] = false;
			});
			setSelectedObj(imageToSelected);
		}
	}, [toBeCopied]);

	return (
		<>
			<input
				type="checkbox"
				id={`gallery`}
				onChange={(e) => setShow(e.target.checked)}
				className="hidden"
			/>
			<div
				className={` text-black ${
					show ? "" : "hidden"
				} absolute top-0 left-0 flex w-full h-full items-center justify-center z-50 bg-slate-800/80`}
			>
				<div className="p-1 lg:w-3/5 lg:h-[94%] bg-slate-900 flex flex-col rounded-sm gap-4 relative overflow-x-hidden h-full">
					<label
						className="absolute top-2 right-2 "
						htmlFor="gallery"
						onClick={() => {
							setToBeCopied([]);
						}}
					>
						<AiFillCloseCircle
							size={24}
							className="text-cyan-400"
						/>
					</label>
					<ul
						className="marker:text-cyan-400 text-sm lg:text-base  list-disc list-inside text-gray-100/90 py-2 px-5 lg:px-4 lg:w-5/6"
						role="list"
					>
						<li>
							Selecting an image or multiple images will generate
							a string containing their name/names which you can
							copy and paste in your markdown.
						</li>
						<li>Hover/Touch on the image to select.</li>
						<li>Select multiple images for a carousel.</li>
						<li>
							Copy the string below after selecting the images and
							paste it in your markdown appropriately to display
							the images on preview.
						</li>
						<li>
							A post is allowed to have a maximum of {PHOTO_LIMIT}{" "}
							images to prevent someone from uploading their
							entire gallery.
						</li>
					</ul>
					<div className="flex  text-white w-full h-max lg:w-2/3 self-center text-sm">
						{/* <span className="bg-cyan-400 text-black flex items-center font-semibold rounded-l-md p-1">
							Image(s) :{" "}
						</span> */}
						<span className="px-2 lg:w-1/2 grow border-cyan-400 border-2 overflow-auto">
							{toBeCopied.join(",")}
						</span>
						<label
							className="text-black bg-cyan-400 hover:bg-cyan-700 p-1 rounded-r-md flex items-center"
							onClick={() => {
								navigator.clipboard.writeText(
									toBeCopied.join(",")
								);
								setToBeCopied([]);
							}}
							htmlFor="gallery"
						>
							<MdOutlineContentCopy size={20} />
						</label>
					</div>
					<div className="justify-center tabs">
						<span
							onClick={() => setImageAge("new")}
							className={`${
								imageAge === "new" ? "tab-active" : ""
							} tab tab-bordered`}
						>
							New Uploaded
						</span>
						{prevImages && (
							<span
								onClick={() => setImageAge("old")}
								className={`${
									imageAge === "old" ? "tab-active" : ""
								} tab tab-bordered`}
							>
								Previously Uploaded
							</span>
						)}
					</div>
					<div
						className={`flex flex-row w-[200%] overflow-y-auto scrollbar-thin gap-2 ${
							imageAge === "new" ? "" : "-translate-x-1/2"
						} 
						transition-all duration-500`}
					>
						{currImages && imageToUrl && (
							<ImageGrid
								type="new"
								images={currImages}
								{...{
									imageToUrl,
									selectedObj,
									setSelectedObj,
									setToBeCopied,
									setImages,
									extra:
										PHOTO_LIMIT -
										currImages.length -
										(prevImages?.length || 0),
								}}
							/>
						)}
						{prevImages && imageToUrl && (
							<ImageGrid
								type="old"
								images={prevImages}
								{...{
									imageToUrl,
									selectedObj,
									setSelectedObj,
									setToBeCopied,
									setImages,
									toBeDeletedFromStorage,
									setToBeDeletedFromStorage,
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

function ImageGrid({
	type,
	images,
	imageToUrl,
	selectedObj,
	setSelectedObj,
	setToBeCopied,
	setImages,
	toBeDeletedFromStorage,
	setToBeDeletedFromStorage,
	extra,
}: {
	type: "new" | "old";
	images: string[];
	imageToUrl: Record<string, string>;
	selectedObj: Record<string, boolean>;
	setSelectedObj: React.Dispatch<
		React.SetStateAction<Record<string, boolean>>
	>;
	toBeDeletedFromStorage?: string[];
	setToBeCopied: React.Dispatch<React.SetStateAction<string[]>>;
	setImages: React.Dispatch<React.SetStateAction<File[]>>;
	setToBeDeletedFromStorage?: React.Dispatch<React.SetStateAction<string[]>>;
	extra?: number;
}) {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-3 gap-x-1 h-max  w-full auto-rows-max">
			{images &&
				imageToUrl &&
				images.map((imageName) => {
					return (
						<div
							className="col-span-1 row-span-1 relative group rounded-sm"
							key={imageName}
						>
							<Image
								src={imageToUrl[imageName]}
								layout="responsive"
								width={1000}
								height={1000}
								objectFit="contain"
								className={` ${
									selectedObj[imageName] ||
									toBeDeletedFromStorage?.includes(imageName)
										? "opacity-30"
										: "group-hover:opacity-50"
								}`}
							/>
							<div
								className={`absolute ${
									selectedObj[imageName] ||
									toBeDeletedFromStorage?.includes(imageName)
										? "flex"
										: "group-hover:flex hidden"
								}  top-1/2 left-0 w-full justify-center gap-10`}
							>
								{type === "old" &&
								toBeDeletedFromStorage?.includes(imageName) ? (
									<></>
								) : (
									<input
										type="checkbox"
										name=""
										id=""
										onChange={() => {
											if (selectedObj[imageName]) {
												setToBeCopied((prev) =>
													prev.filter(
														(name) =>
															name !== imageName
													)
												);
												setSelectedObj((prev) => ({
													...prev,
													[imageName]: false,
												}));
											} else {
												setToBeCopied((prev) => [
													...prev,
													imageName,
												]);

												setSelectedObj((prev) => ({
													...prev,
													[imageName]: true,
												}));
											}
										}}
									/>
								)}
								{type === "old" &&
								toBeDeletedFromStorage?.includes(imageName) ? (
									<span
										onClick={() => {
											if (setToBeDeletedFromStorage)
												setToBeDeletedFromStorage(
													(prev) =>
														prev.filter(
															(i) =>
																i !== imageName
														)
												);
										}}
										className="bg-cyan-400 p-1 rounded-md"
									>
										<RiArrowGoBackFill />
									</span>
								) : (
									<span
										onClick={() => {
											setToBeCopied((prev) =>
												prev.filter(
													(i) => i !== imageName
												)
											);
											setSelectedObj((prev) => ({
												...prev,
												[imageName]: false,
											}));

											setImages((prev) =>
												prev.filter(
													(i) =>
														processImageName(
															i.name
														) !== imageName
												)
											);
											if (setToBeDeletedFromStorage)
												setToBeDeletedFromStorage(
													(prev) => [
														...prev,
														imageName,
													]
												);
										}}
									>
										<AiFillDelete className="text-red-600" />
									</span>
								)}
							</div>
						</div>
					);
				})}
			{extra && (
				<label
					htmlFor="extra-images"
					className="text-white hover:bg-slate-700 col-span-1 row-span-1 aspect-square flex items-center justify-center"
				>
					<BiImageAdd size={40} />
				</label>
			)}
		</div>
	);
}

export default GalleryModal;
