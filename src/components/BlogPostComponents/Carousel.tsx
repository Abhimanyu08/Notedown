"use client";
import { BlogContext } from "@/app/post/components/BlogState";
import Image from "next/image";
import React, { memo, useContext, useEffect, useState } from "react";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";

function Carousel({
	imageNamesString,
	captionString,
}: {
	imageNamesString: string;
	captionString: string;
}) {
	const { blogState, dispatch } = useContext(BlogContext);
	const [images, setImages] = useState<string[]>([]);
	const [captions, setCaptions] = useState<string[]>([]);

	useEffect(() => {
		const imageNames = imageNamesString.split(",");
		const validImages = imageNames.filter(
			(i) =>
				Object.hasOwn(blogState.uploadedImages, i) ||
				Object.hasOwn(blogState.imagesToFiles, i)
		);
		setImages(validImages);

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
					key={idx}
					style={{
						transform: `translateX(${100 * idx}%)`,
					}}
				>
					<div className="grow relative">
						<Image
							src={
								blogState.imagesToFiles[image]
									? window.URL.createObjectURL(
											blogState.imagesToFiles[image]
									  )
									: blogState.uploadedImages[image]
							}
							alt={captions[idx] || ""}
							fill
							style={{ objectFit: "contain" }}
						/>
					</div>
					<figcaption
						className={`text-center  text-gray-400 text-[0.875em]`}
					>
						{captions.at(idx) || ""}
					</figcaption>
				</figure>
			))}
		</div>
	);
}

export default memo(Carousel);
// export default Carousel;
