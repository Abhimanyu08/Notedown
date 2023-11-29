"use client";
import { EditorContext } from "@/app/write/components/EditorContext";
import useRecoverImages from "@/hooks/useRecoverImages";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { lazy, memo, useContext, useEffect, useState } from "react";
import ExapandableCarouselContainer from "./MinimalComponents/ExapandableCarouselContainer";

const ImageUploader = lazy(
	() => import("@components/EditorComponents/ImageUploader")
);
function Carousel({
	imageNamesString,
	captionString,
	end,
}: {
	imageNamesString: string;
	captionString: string;
	end?: number;
}) {
	const { dispatch } = useContext(EditorContext);
	const [imageSrcs, setImagesrcs] = useState<string[]>([]);
	const [captions, setCaptions] = useState<string[]>([]);
	const pathname = usePathname();
	const imageUrls = useRecoverImages({
		imageNames: imageNamesString.split(","),
	});
	useEffect(() => {
		const imageNames = imageNamesString.split(",");

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

	useEffect(() => {
		const imageNames = imageNamesString.split(",");
		if (imageUrls.length === imageNames.length) {
			setImagesrcs(imageUrls);
		}
	}, [imageUrls]);

	useEffect(() => {
		setCaptions(captionString.split(";"));
	}, [captionString]);

	//show -> The idx of the image to show out of all the images.
	// w-[${100 * images.length}%]
	// w-1/${images.length}
	return (
		<>
			{pathname?.startsWith("/write") && (
				<div className="flex w-full justify-end">
					<ImageUploader add={true} end={end} />
				</div>
			)}

			<ExapandableCarouselContainer>
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
			</ExapandableCarouselContainer>
		</>
	);
}

export default memo(Carousel);
// export default Carousel;
