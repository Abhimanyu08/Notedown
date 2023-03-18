import { useRouter } from "next/router";
import React from "react";
import { SUPABASE_IMAGE_BUCKET } from "../../../utils/constants";
import { supabase } from "../../../utils/supabaseClient";

import Image from "next/image";
import dynamic from "next/dynamic";

export default function DrawingOfImage({
	canvasImageName,
	imageFolder,
}: {
	canvasImageName: string;
	imageFolder?: string;
}) {
	const router = useRouter();

	if (router.asPath.startsWith("/edit")) {
		const DynamicDrawingComponenet = dynamic(() => import(`./TLDrawing`), {
			ssr: false,
		});
		return (
			<DynamicDrawingComponenet {...{ canvasImageName, imageFolder }} />
		);
	}

	const { publicURL } = supabase.storage
		.from(SUPABASE_IMAGE_BUCKET)
		.getPublicUrl(`${imageFolder}/${canvasImageName}.png`);

	return (
		<div className="w-full bg-black">
			<img
				src={publicURL || ""}
				// layout="fill"
				width={1440}
				height={1080}
				alt="canvas image"
			/>
		</div>
	);
}
