"use client";
import { BlogContext } from "@/app/apppost/components/BlogState";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";

function Carousel({
	imageNames,
	captions,
}: {
	imageNames: string[];
	captions: string[];
}) {
	const [show, setShow] = useState(0);
	const { blogState, dispatch } = useContext(BlogContext);

	useEffect(() => {
		dispatch({
			type: "add images to upload",
			payload: imageNames,
		});
		return () => {
			dispatch({
				type: "remove image from upload",
				payload: imageNames,
			});
		};
	}, []);

	//show -> The idx of the image to show out of all the images.
	const onSlide: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();
		if ((e.target as any).id === "pre") {
			if (show === 0) {
				setShow(imageNames.length - 1);
			} else {
				setShow(show - 1);
			}
		} else {
			if (show === imageNames.length - 1) {
				setShow(0);
			} else {
				setShow(show + 1);
			}
		}
	};
	// w-[${100 * images.length}%]
	// w-1/${images.length}
	return (
		<>
			<div
				className={`relative flex w-[600%] h-auto not-prose`}
				// style={{ transform: `translateX(-${100 * show}%)` }}
			>
				{imageNames.map((image, idx) => (
					<div
						key={idx}
						className="w-1/6 transition-transform duration-300 carousel"
						style={{ transform: `translateX(-${100 * show}%)` }}
					>
						<div
							className={`w-full h-full relative  ${
								show === idx ? "" : "hidden"
							}`}
							key={idx}
						>
							<Image
								src={
									blogState.imagesToFiles[image]
										? window.URL.createObjectURL(
												blogState.imagesToFiles[image]
										  )
										: blogState.uploadedImages[image]
								}
								alt={captions[idx] || ""}
								// width={1440}
								// height={1080}
								style={{ objectFit: "contain" }}
								fill
							/>
						</div>
					</div>
				))}
			</div>
			<div className="flex justify-between not-prose items-center mt-2 h-5">
				<button
					className="rounded-full text-white dark:text-black dark:bg-white text-sm bg-black w-5  text-center cursor-pointer"
					id="pre"
					onClick={onSlide}
				>
					❮
				</button>
				<figcaption
					className={`text-center text-xs  dark:text-font-grey  text-black  italic`}
				>
					{captions.at(show) || ""}
				</figcaption>
				<button
					className="rounded-full text-white dark:text-black dark:bg-white text-sm bg-black w-5 text-center cursor-pointer"
					id="post"
					onClick={onSlide}
				>
					❯
				</button>
			</div>
		</>
	);
}

export default Carousel;
