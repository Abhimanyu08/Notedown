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
	const [show, setShow] = useState(0);
	const { blogState, dispatch } = useContext(BlogContext);
	const [images, setImages] = useState<string[]>([]);
	// const [imageToUrls, setImageToUrls] = useState<string[]>([])
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
	const onSlide: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault();
		if ((e.target as any).id === "pre") {
			if (show === 0) {
				setShow(images.length - 1);
			} else {
				setShow(show - 1);
			}
		} else {
			if (show === images.length - 1) {
				setShow(0);
			} else {
				setShow(show + 1);
			}
		}
	};
	// w-[${100 * images.length}%]
	// w-1/${images.length}
	return (
		<div className="w-4/5 mx-auto">
			<div
				className={`relative flex w-[600%] h-auto not-prose`}
				// style={{ transform: `translateX(-${100 * show}%)` }}
			>
				{images.map((image, idx) => (
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
			<div className="flex justify-between not-prose items-center mt-2">
				<button
					className="rounded-full flex p-2 hover:scale-105 active:scale-95  justify-start text-black dark:text-white dark:hover:bg-slate-800 cursor-pointer"
					id="pre"
					onClick={onSlide}
				>
					<BsArrowLeft size={16} />
				</button>
				<figcaption
					className={`text-center text-xs  dark:text-font-grey  text-black  italic`}
				>
					{captions.at(show) || ""}
				</figcaption>
				<button
					className="rounded-full flex p-2 hover:scale-105 active:scale-95  justify-start text-black dark:text-white dark:hover:bg-slate-800 cursor-pointer"
					id="post"
					onClick={onSlide}
				>
					<BsArrowRight size={16} />
				</button>
			</div>
		</div>
	);
}

export default memo(Carousel);
// export default Carousel;
