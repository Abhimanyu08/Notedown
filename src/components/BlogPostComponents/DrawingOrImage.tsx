"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { BlogContext } from "@components/BlogPostComponents/BlogState";
import { useContext } from "react";
import TLDrawing from "./TLDrawing";
import { ExpandedImageContext } from "./ExpandedImageProvider";

export default function DrawingOrImage({
	canvasImageName,
}: {
	canvasImageName: string;
}) {
	const pathname = usePathname();

	const { blogState } = useContext(BlogContext);
	const { setImageUrl } = useContext(ExpandedImageContext);

	if (pathname?.startsWith("/write")) {
		return <TLDrawing {...{ canvasImageName }} key={canvasImageName} />;
	}
	const imageSrc = blogState.uploadedImages[`${canvasImageName}.png`] || "";

	return (
		<div className="w-full bg-white">
			<Image
				src={imageSrc}
				// layout="fill"
				width={1440}
				height={1080}
				onClick={() => setImageUrl && setImageUrl(imageSrc)}
				alt="canvas image"
			/>
		</div>
	);
}
