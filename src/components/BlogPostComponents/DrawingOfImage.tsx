import { useRouter } from "next/router";
import React, { useState } from "react";
import { SUPABASE_IMAGE_BUCKET } from "../../../utils/constants";
import { supabase } from "../../../utils/supabaseClient";

import dynamic from "next/dynamic";

export default function DrawingOrImage({
	canvasImageName,
	imageFolder,
}: {
	canvasImageName: string;
	imageFolder?: string;
}) {
	const router = useRouter();
	const [DrawingComponent, setDrawingComponent] = useState<
		React.ComponentType<{
			canvasImageName: string;
			imageFolder?: string | undefined;
		}>
	>();

	if (router.asPath.startsWith("/edit")) {
		if (DrawingComponent === undefined) {
			const DynamicDrawingComponenet = dynamic(
				() => import(`./TLDrawing`),
				{
					ssr: false,
				}
			);
			setDrawingComponent(DynamicDrawingComponenet);
			return (
				<DynamicDrawingComponenet
					{...{ canvasImageName, imageFolder }}
				/>
			);
		}
		return <DrawingComponent {...{ canvasImageName, imageFolder }} />;
	}

	const { publicUrl } = supabase.storage
		.from(SUPABASE_IMAGE_BUCKET)
		.getPublicUrl(`${imageFolder}/${canvasImageName}.png`).data;

	return (
		<div className="w-full bg-black">
			<img
				src={publicUrl || ""}
				// layout="fill"
				width={1440}
				height={1080}
				alt="canvas image"
			/>
		</div>
	);
}
