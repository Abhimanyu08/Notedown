"use client";
import { useContext, useEffect, useState } from "react";

import { BlogContext } from "@/app/apppost/components/BlogState";
import { Tldraw } from "@tldraw/tldraw";
import { useSupabase } from "@/app/appContext";
import { SUPABASE_IMAGE_BUCKET } from "@utils/constants";

function TLDrawing({ canvasImageName }: { canvasImageName: string }) {
	// const [app, setApp] = useState<any>();
	// const [currentCanvasImageName, setCurrentCanvasImageName] =
	// 	useState(canvasImageName);
	// // const { canvasImages, setCanvasImages } = useContext(CanvasImageContext);
	const [changeNumber, setChangeNumber] = useState(0);
	const { blogState, dispatch } = useContext(BlogContext);
	const { supabase } = useSupabase();
	useEffect(() => {
		return () => {
			dispatch({
				type: "remove canvas app",
				payload: canvasImageName,
			});
		};
	}, []);

	// useEffect(() => {
	// 	if (
	// 		!app ||
	// 		!canvasImageName ||
	// 		!Object.hasOwn(canvasImages, currentCanvasImageName)
	// 	)
	// 		return;

	// 	setCanvasImages((prev) => {
	// 		if (canvasImageName === currentCanvasImageName) {
	// 			return {
	// 				...prev,
	// 				[canvasImageName]: app,
	// 			};
	// 		}
	// 		return {
	// 			...prev,
	// 			[canvasImageName]: app,
	// 			[currentCanvasImageName]: null,
	// 		};
	// 	});
	// 	setCurrentCanvasImageName(canvasImageName);
	// }, [canvasImageName]);

	const runOnCommad = (app: any) => {
		if (changeNumber === 0) {
			setChangeNumber((prev) => prev + 1);
			return;
		}
		dispatch({
			type: "set canvas apps",
			payload: { [canvasImageName]: app },
		});
	};

	return (
		<>
			<div className="relative w-full aspect-[4/3] self-center not-prose">
				<Tldraw
					key={canvasImageName}
					showMenu={false}
					showMultiplayerMenu={false}
					showPages={false}
					autofocus={false}
					disableAssets={false}
					darkMode={false}
					onMount={(app) => {
						if (
							Object.hasOwn(
								blogState.uploadedImages,
								`${canvasImageName}.png`
							)
						) {
							supabase.storage
								.from(SUPABASE_IMAGE_BUCKET)
								.download(
									`${blogState.blogMeta.imageFolder}/${canvasImageName}.png`
								)
								.then((val) => {
									if (!val.data) return;
									const file = new File(
										[val.data],
										`${canvasImageName}.png`
									);
									app.addMediaFromFiles([file]).then((app) =>
										app.zoomToFit()
									);
								});
						}
					}}
					onCommand={(app) => {
						runOnCommad(app);
					}}
				/>
			</div>
		</>
	);
}

export default TLDrawing;
