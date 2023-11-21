"use client";
import React from "react";
import Image from "next/image";

function MinimalCarousel({
	src,
	alt,
	fileNamesToUrls,
}: {
	src: string;
	alt: string;
	fileNamesToUrls: Record<string, string>;
}) {
	const imageSrcs = src.split(",").map((s) => fileNamesToUrls[s]);
	const captions = alt.split(";");
	return (
		<div className="flex flex-col">
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
								child.classList.replace(
									"opacity-100",
									"opacity-0"
								);
							}
							return;
						}
						if (pr - cl > 100) {
							if (child.classList.contains("opacity-0")) {
								child.classList.replace(
									"opacity-0",
									"opacity-100"
								);
							}
							return;
						}
						if (pr - cl < 100) {
							if (child.classList.contains("opacity-100")) {
								child.classList.replace(
									"opacity-100",
									"opacity-0"
								);
							}
						}
					});
				}}
			>
				{imageSrcs.map((image, idx) => (
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
			</div>
		</div>
	);
}

export default MinimalCarousel;
