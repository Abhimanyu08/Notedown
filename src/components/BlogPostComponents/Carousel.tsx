import Image from "next/image";
import React, { useState } from "react";

function Carousel({
	images,
	height,
	width,
	captions,
}: {
	images: string[];
	captions: string[];
	height: number;
	width: number;
}) {
	const [show, setShow] = useState(0);

	//show -> The idx of the image to show out of all the images.
	const onSlide: React.MouseEventHandler<HTMLDivElement> = (e) => {
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
		<>
			<div
				className={`relative flex w-[600%] h-auto`}
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
								src={image}
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
			<div className="flex justify-between not-prose items-center mt-1 h-5">
				<div
					className="rounded-full text-white dark:text-black dark:bg-white text-sm bg-black w-5  text-center"
					id="pre"
					onClick={onSlide}
				>
					❮
				</div>
				<figcaption
					className={`text-center text-sm  text-black dark:text-gray-200 italic`}
				>
					{captions.at(show) || ""}
				</figcaption>
				<div
					className="rounded-full text-white dark:text-black dark:bg-white text-sm bg-black w-5 text-center"
					id="post"
					onClick={onSlide}
				>
					❯
				</div>
			</div>
		</>
	);
}

export default Carousel;
