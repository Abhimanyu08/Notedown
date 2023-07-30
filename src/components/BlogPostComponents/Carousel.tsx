"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import { BlogContext } from "@components/BlogPostComponents/BlogState";
import Image from "next/image";
import React, { memo, useContext, useEffect, useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { ExpandedImageContext } from "./ExpandedImage/ExpandedImageProvider";
import ImageUploader from "@components/EditorComponents/ImageUploader";

function Carousel({
	imageNamesString,
	captionString,
	end,
}: {
	imageNamesString: string;
	captionString: string;
	end?: number;
}) {
	const { blogState } = useContext(BlogContext);
	const { editorState, dispatch } = useContext(EditorContext);
	const [images, setImages] = useState<string[]>([]);
	const [captions, setCaptions] = useState<string[]>([]);
	const { setImageUrl } = useContext(ExpandedImageContext);

	useEffect(() => {
		const imageNames = imageNamesString.split(",");
		const validImages = imageNames.filter(
			(i) =>
				Object.hasOwn(blogState.uploadedImages, i) ||
				Object.hasOwn(editorState?.imagesToFiles, i)
		);
		setImages(
			validImages.map((image) =>
				editorState.imagesToFiles[image]
					? window.URL.createObjectURL(
							editorState.imagesToFiles[image]
					  )
					: blogState.uploadedImages[image]
			)
		);

		dispatch({
			type: "add images to upload",
			payload: validImages,
		});
		return () => {
			dispatch({
				type: "remove image from upload",
				payload: validImages,
			});
		};
	}, []);

	useEffect(() => {
		setCaptions(captionString.split(";"));
	}, [captionString]);

	//show -> The idx of the image to show out of all the images.
	// w-[${100 * images.length}%]
	// w-1/${images.length}
	return (
		<div
			className="w-4/5 mx-auto h-[500px] overflow-x-auto
		lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
				relative
				not-prose
		"
			onScroll={(e) => {
				const { left: pl, right: pr } =
					e.currentTarget.getBoundingClientRect();
				const children =
					e.currentTarget.querySelectorAll("div > figure");

				Array.from(children).forEach((child) => {
					const { left: cl, right: cr } =
						child.getBoundingClientRect();

					if (cr - pl < 100) {
						if (child.classList.contains("opacity-100")) {
							child.classList.replace("opacity-100", "opacity-0");
						}
						return;
					}
					if (pr - cl > 100) {
						if (child.classList.contains("opacity-0")) {
							child.classList.replace("opacity-0", "opacity-100");
						}
						return;
					}
					if (pr - cl < 100) {
						if (child.classList.contains("opacity-100")) {
							child.classList.replace("opacity-100", "opacity-0");
						}
					}
				});
			}}
		>
			{images.map((image, idx) => (
				<figure
					className={`

						w-full
						h-full
						absolute
						inset-x-0
						flex flex-col
						${idx === 0 ? "opacity-100" : "opacity-0"}
						transition-opacity duration-500
				`}
					key={image}
					style={{
						transform: `translateX(${100 * idx}%)`,
					}}
				>
					<div className="grow relative">
						<Image
							src={image}
							alt={captions[idx] || ""}
							fill
							style={{ objectFit: "contain" }}
							onClick={() => setImageUrl && setImageUrl(image)}
							className="cursor-zoom-in"
						/>
					</div>
					<figcaption
						className={`text-center italic text-gray-400 mt-2 text-[0.875em]`}
					>
						{captions.at(idx) || ""}
					</figcaption>
				</figure>
			))}
			<ImageUploader add={true} end={end} />
		</div>
	);
}

export default memo(Carousel);
// export default Carousel;
