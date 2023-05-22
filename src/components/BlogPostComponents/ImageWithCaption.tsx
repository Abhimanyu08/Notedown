import React, { useContext, useEffect } from "react";
import Image from "next/image";
import { EditorContext } from "@/app/appwrite/components/EditorContext";
import { BlogContext } from "@/app/apppost/components/BlogState";

function ImageWithCaption({ name, alt }: { name: string; alt: string }) {
	const { blogState, dispatch } = useContext(BlogContext);
	const src =
		window.URL.createObjectURL(blogState.uploadedImages[name]) || "";

	useEffect(() => {
		dispatch({ type: "add images to upload", payload: name });

		return () => {
			dispatch({ type: "remove image from upload", payload: name });
		};
	}, []);

	return (
		<div className="w-full mb-4">
			<Image
				// layout="fill"
				src={src}
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
