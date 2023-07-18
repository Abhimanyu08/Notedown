"use client";
import React, { useContext, useEffect } from "react";
import Image from "next/image";
import { BlogContext } from "@/app/post/components/BlogState";

function ImageWithCaption({ name, alt }: { name: string; alt: string }) {
	const { blogState, dispatch } = useContext(BlogContext);

	useEffect(() => {
		dispatch({ type: "add images to upload", payload: [name] });
		return () => {
			dispatch({ type: "remove image from upload", payload: [name] });
		};
	}, []);

	const getImageSrc = (name: string) => {
		if (Object.hasOwn(blogState.imagesToFiles, name)) {
			return window.URL.createObjectURL(blogState.imagesToFiles[name]);
		}
		if (Object.hasOwn(blogState.uploadedImages, name)) {
			return blogState.uploadedImages[name];
		}

		return "";
	};

	return (
		<div className="w-full mb-4">
			<Image
				// layout="fill"

				src={getImageSrc(name)}
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
