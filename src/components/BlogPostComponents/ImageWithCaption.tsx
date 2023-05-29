"use client";
import React, { useContext, useEffect } from "react";
import Image from "next/image";
import { BlogContext } from "@/app/apppost/components/BlogState";

function ImageWithCaption({ name, alt }: { name: string; alt: string }) {
	const { blogState, dispatch } = useContext(BlogContext);

	useEffect(() => {
		dispatch({ type: "add images to upload", payload: [name] });
		// dispatch({
		// 	type: "remove images from imagesToDelete",
		// 	payload: [name],
		// });
		// we don't need to perform the above step since we'll only delete imagesToDelete - (imagesToDelete intersection imagesToUpload)

		return () => {
			dispatch({ type: "remove image from upload", payload: [name] });
			// dispatch({ type: "add images to delete", payload: [name] });
			//we don't even need to add images to delete. We'll just delete the images which are key of uploadedImages but are absent from imageToUpload.
		};
	}, []);

	return (
		<div className="w-full mb-4">
			<Image
				// layout="fill"
				src={
					blogState.imagesToFiles[name]
						? window.URL.createObjectURL(
								blogState.imagesToFiles[name]
						  )
						: blogState.uploadedImages[name]
				}
				alt={alt}
				width={1440}
				height={1080}
			/>
			<figcaption className="text-center italic text-font-grey">
				{alt}
			</figcaption>
		</div>
	);
}

export default ImageWithCaption;
