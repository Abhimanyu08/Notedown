import React from "react";
import Image from "next/image";

function ImageWithCaption({ src, alt }: { src: string; alt: string }) {
	return (
		<div className="w-full mb-4">
			<Image
				// layout="fill"
				{...{ src, alt }}
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
