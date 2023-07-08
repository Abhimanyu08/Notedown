"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import Image from "next/image";
import { memo, useContext, useEffect, useState } from "react";

function ImageWithCaption({ name, alt }: { name: string; alt: string }) {
	const { blogState } = useContext(BlogContext);
	const { editorState, dispatch } = useContext(EditorContext);
	const [imageSrc, setImageSrc] = useState("");

	useEffect(() => {
		if (name.startsWith("http")) {
			setImageSrc(name);
			return;
		}
		if (
			Object.hasOwn(editorState.imagesToFiles, name) ||
			Object.hasOwn(blogState.uploadedImages, name)
		) {
			setImageSrc(
				editorState.imagesToFiles[name]
					? window.URL.createObjectURL(
							editorState.imagesToFiles[name]
					  )
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
