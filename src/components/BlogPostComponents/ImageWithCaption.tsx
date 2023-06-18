"use client";
import React, { memo, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { BlogContext } from "@/app/post/components/BlogState";

function ImageWithCaption({ name, alt }: { name: string; alt: string }) {
	const { blogState, dispatch } = useContext(BlogContext);
	const [validName, setValidName] = useState("");

	useEffect(() => {
		if (
			Object.hasOwn(blogState.imagesToFiles, name) ||
			Object.hasOwn(blogState.uploadedImages, name)
		) {
			setValidName(name);
			dispatch({ type: "add images to upload", payload: [name] });
		}
		return () => {
			dispatch({ type: "remove image from upload", payload: [name] });
		};
	}, []);

	return (
		<div className="w-full mb-4">
			{validName && (
				<>
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
				</>
			)}
		</div>
	);
}

export default memo(ImageWithCaption);
