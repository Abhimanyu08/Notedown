import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { TiArrowBack } from "react-icons/ti";
import {
	PHOTO_LIMIT,
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
} from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";

interface DeleteImagesModalProps {
	imageNames: string[];
	prevImages: string[];
	images: File[];
	setPrevImages: Dispatch<SetStateAction<string[]>>;
	setImages: Dispatch<SetStateAction<File[]>>;
	setToBeDeletedFromStorage: Dispatch<SetStateAction<string[]>>;
}

function DeleteImagesModal({
	imageNames,
	prevImages,
	images,
	setImages,
	setPrevImages,
	setToBeDeletedFromStorage,
}: DeleteImagesModalProps) {
	const [okToDelete, setOkToDelete] = useState(false);
	const [currImages, setCurrImages] = useState<string[]>([]);
	const [toBeDeleted, setToBeDeleted] = useState<string[]>([]);
	const [deleting, setDeleting] = useState(false);
	const [deleted, setDeleted] = useState(false);
	const [show, setShow] = useState(false);

	useEffect(() => {
		if (imageNames.length > 0) setCurrImages([...imageNames]);
	}, [imageNames]);

	const onDelete = async () => {
		if (toBeDeleted.length === 0) return;

		setDeleting(true);
		let localImages = [...images];
		let storageImages = [...prevImages];
		toBeDeleted.forEach((im) => {
			localImages = localImages.filter((li) => li.name !== im);
			storageImages = storageImages.filter((si) => si !== im);
		});

		let toBeDeletedFromStorage = prevImages.filter((im) =>
			toBeDeleted.some((i) => i === im)
		);
		setImages(localImages);
		setPrevImages(storageImages);
		setToBeDeletedFromStorage(toBeDeletedFromStorage);
		setDeleting(false);
		setDeleted(true);
		setOkToDelete(false);
	};

	return (
		<>
			<input
				type="checkbox"
				id={`delete-images`}
				onChange={(e) => setShow(e.target.checked)}
				className="hidden"
			/>
			<div
				className={` text-black ${
					show ? "" : "hidden"
				} absolute top-0 left-0 flex w-full h-full items-center justify-center z-50`}
			>
				<label className=" bg-cyan-500 mx-2 w-full md:w-5/6 h-fit max-h-80 max-w-full md:mx-0 lg:w-1/2 p-6 rounded-lg flex flex-col justify-between">
					<div className="grid grid-rows-2 md:grid-cols-2  md:divide-y-0 md:divide-x-2 md:grid-rows-none divide-black divide-y-2 h-fit max-h-60">
						{okToDelete ? (
							<>
								<div className="flex flex-col gap-2 col-span-1 min-h-0 overflow-y-scroll">
									{currImages.map((i, idx) => (
										<div
											className="flex items-end gap-2"
											key={idx}
										>
											<span className="">{i}</span>
											<div
												className="pb-1"
												onClick={() => {
													setToBeDeleted((prev) => [
														...prev,
														i,
													]);
													setCurrImages((prev) =>
														prev.filter(
															(im) => im !== i
														)
													);
												}}
											>
												<AiFillDelete size={14} />
											</div>
										</div>
									))}
								</div>
								<div className="flex flex-col gap-2 col-span-1 min-h-0 overflow-y-scroll md:pl-2">
									{toBeDeleted.map((i, idx) => (
										<div
											className="flex items-end gap-2"
											key={idx}
										>
											<span className="">{i}</span>
											<div
												className="pb-1"
												onClick={() => {
													setToBeDeleted((prev) =>
														prev.filter(
															(im) => im !== i
														)
													);
													setCurrImages((prev) => [
														...prev,
														i,
													]);
												}}
											>
												<TiArrowBack size={18} />
											</div>
										</div>
									))}
								</div>
							</>
						) : (
							<div className="col-span-2 text-sm md:text-base">
								{deleted ? (
									<span>
										Deletion Successfull! Do not forget to
										edit your markdown so that you {"don't"}{" "}
										end up having empty image tags
									</span>
								) : (
									<span>
										You can upload upto {PHOTO_LIMIT}{" "}
										images. This is to prevent someone from
										uploading their entire photo gallery on
										my measly servers. Do you want to delete
										some of your previously uploaded images?
										Your already uploaded images will be
										deleted only if you save the changes
									</span>
								)}
							</div>
						)}
					</div>
					<div className="flex gap-2 justify-end mt-4">
						{okToDelete ? (
							<span
								className={` btn-sm btn capitalize  text-white ${
									deleting ? "loading" : ""
								}`}
								onClick={onDelete}
							>
								Delete
							</span>
						) : (
							<label
								className="btn-sm btn capitalize  text-white"
								onClick={() => {
									if (!deleted)
										setOkToDelete((prev) => !prev);
									setDeleted(false);
								}}
								htmlFor="delete-images"
							>
								Ok
							</label>
						)}
						{okToDelete && (
							<label
								className="btn-sm btn capitalize  text-white"
								htmlFor="delete-images"
								onClick={() => {
									setOkToDelete(false);
									setToBeDeleted([]);
									setCurrImages(imageNames);
								}}
							>
								Cancel
							</label>
						)}
					</div>
				</label>
			</div>
		</>
	);
}

export default DeleteImagesModal;
