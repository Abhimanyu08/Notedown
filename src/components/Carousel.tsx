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
		<div className={`relative h-full flex w-[600%] `}>
			<div
				className={`absolute top-1/2 z-10 flex w-1/6  justify-between px-1`}
			>
				<div
					className="btn btn-active glass btn-circle btn-sm text-black"
					id="pre"
					onClick={onSlide}
				>
					❮
				</div>
				<div
					className="btn btn-active glass btn-circle btn-sm text-black"
					id="post"
					onClick={onSlide}
				>
					❯
				</div>
			</div>
			{images.map((image, idx) => (
				<div
					className="w-1/6 h-full transition-transform duration-300"
					style={{ transform: `translateX(-${100 * show}%)` }}
				>
					<figure
						className={` w-full  ${
							show === idx ? "" : "invisible"
						}`}
						key={idx}
					>
						<Image
							src={image}
							alt={captions[idx] || ""}
							width={width}
							height={height}
							objectFit="contain"
							layout={"responsive"}
						/>
					</figure>

					<figcaption className="text-center text-white italic">
						{captions.at(idx) || ""}
					</figcaption>
				</div>
			))}
		</div>
	);
}

export default Carousel;
