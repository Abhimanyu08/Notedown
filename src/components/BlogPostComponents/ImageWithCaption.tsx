"use client";
import React, { memo, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { BlogContext } from "@/app/post/components/BlogState";

function ImageWithCaption({ name, alt }: { name: string; alt: string }) {
	const { blogState, dispatch } = useContext(BlogContext);
	const [imageSrc, setImageSrc] = useState("");

	useEffect(() => {
		if (name.startsWith("http")) {
			setImageSrc(name);
			return;
		}
		if (
			Object.hasOwn(blogState.imagesToFiles, name) ||
			Object.hasOwn(blogState.uploadedImages, name)
		) {
			setImageSrc(
				blogState.imagesToFiles[name]
					? window.URL.createObjectURL(blogState.imagesToFiles[name])
					: blogState.uploadedImages[name]
			);
			dispatch({ type: "add images to upload", payload: [name] });
		}
		return () => {
			dispatch({ type: "remove image from upload", payload: [name] });
		};
	}, []);

	return (
		<figure className="w-4/5 mb-4 mx-auto">
			{imageSrc && (
				<>
					<Image
						// layout="fill"
						src={imageSrc}
						alt={alt}
						width={1440}
						height={1080}
					/>
					<figcaption className="text-center italic">
						{alt}
					</figcaption>
				</>
			)}
		</figure>
	);
}

export default memo(ImageWithCaption);
