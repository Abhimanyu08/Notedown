"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { BlogContext } from "@/app/apppost/components/BlogState";
import { useContext } from "react";
import TLDrawing from "./TLDrawing";

export default function DrawingOrImage({
	canvasImageName,
}: {
	canvasImageName: string;
}) {
	const pathname = usePathname();

	const { blogState } = useContext(BlogContext);

	if (pathname?.startsWith("/appwrite")) {
		return <TLDrawing {...{ canvasImageName }} key={canvasImageName} />;
	}

	return (
		<div className="w-full bg-white">
			<Image
				src={blogState.uploadedImages[`${canvasImageName}.png`] || ""}
				// layout="fill"
				width={1440}
				height={1080}
				alt="canvas image"
			/>
		</div>
	);
}
