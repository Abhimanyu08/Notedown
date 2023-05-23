"use client";
import { usePathname } from "next/navigation";

import { SUPABASE_IMAGE_BUCKET } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import TLDrawing from "./TLDrawing";

export default function DrawingOrImage({
	canvasImageName,
	imageFolder,
}: {
	canvasImageName: string;
	imageFolder?: string;
}) {
	const pathname = usePathname();
	// const [DrawingComponent, setDrawingComponent] = useState<
	// 	React.ComponentType<{
	// 		canvasImageName: string;
	// 		imageFolder?: string | undefined;
	// 	}>
	// >();

	if (pathname?.startsWith("/appwrite")) {
		// if (DrawingComponent === undefined) {
		// 	const DynamicDrawingComponenet = dynamic(
		// 		() => import(`./TLDrawing`),
		// 		{
		// 			ssr: false,
		// 		}
		// 	);
		// 	setDrawingComponent(DynamicDrawingComponenet);

		// 	return (
		// 		<DynamicDrawingComponenet
		// 			{...{ canvasImageName, imageFolder }}
		// 		/>
		// 	);
		// }
		// return <DrawingComponent {...{ canvasImageName, imageFolder }} />;
		return (
			<TLDrawing
				{...{ canvasImageName, imageFolder }}
				key={canvasImageName}
			/>
		);
	}

	const { publicUrl } = supabase.storage
		.from(SUPABASE_IMAGE_BUCKET)
		.getPublicUrl(`${imageFolder}/${canvasImageName}.png`).data;

	return (
		<div className="w-full bg-white">
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
