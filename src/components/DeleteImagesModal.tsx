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
				<label className=" bg-cyan-500 w-1/2 p-6 rounded-lg">
					<div className="grid grid-cols-2 auto-cols-max divide-x-2 divide-black">
						{okToDelete ? (
							<>
								<div className="flex flex-col gap-2 col-span-1">
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
								<div className="flex flex-col gap-2 col-span-1 pl-2">
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
							<p className="col-span-2">
								{deleted ? (
									<span>
										Deletion Successfull! Do not forget to
										edit your markdown so that you do not
										end up having empty image tags
									</span>
								) : (
									<span>
										You can upload upto {PHOTO_LIMIT}{" "}
										images. This is to prevent someone from
										uploading their entire photo gallery on
										my measly servers. Do you want to delete
										some of your previously uploaded images?
										Your images already on the server will
										be deleted only if you save the changes
									</span>
								)}
							</p>
						)}
					</div>
					<div className="mt-10 flex gap-2 justify-end">
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
								}}
								htmlFor={deleted ? "delete-images" : "anon"}
							>
								{deleted ? "Done" : "Ok"}
							</label>
						)}
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
					</div>
				</label>
			</div>
		</>
	);
}

export default DeleteImagesModal;
