"use client";
import { useContext, useEffect, useState } from "react";

import { useSupabase } from "@/app/appContext";
import { BlogContext } from "@/app/post/components/BlogState";
import { Tldraw, TldrawApp } from "@tldraw/tldraw";
import { SUPABASE_IMAGE_BUCKET } from "@utils/constants";

function TLDrawing({ canvasImageName }: { canvasImageName: string }) {
	const [changeNumber, setChangeNumber] = useState(0);
	const { blogState, dispatch } = useContext(BlogContext);
	const { supabase } = useSupabase();
	const [app, setApp] = useState<TldrawApp>();
	useEffect(() => {
		if (!app) return;

		const shapeString = sessionStorage.getItem(`${canvasImageName}`);
		if (shapeString) {
			const shapes = JSON.parse(shapeString);
			sessionStorage.removeItem(`${canvasImageName}`);
			if (shapes.length > 0) {
				// app.createShapes(assets);
				app.insertContent({ shapes });
			}
		}
		dispatch({
			type: "add images to upload",
			payload: [`${canvasImageName}.png`],
		});
		return () => {
			sessionStorage.setItem(
				`${canvasImageName}`,
				JSON.stringify(app!.getShapes())
			);
			dispatch({
				type: "remove canvas app",
				payload: canvasImageName,
			});

			dispatch({
				type: "remove image from upload",
				payload: [`${canvasImageName}.png`],
			});
		};
	}, [app]);

	// useEffect(() => {
	// 	if (!editorState.editingMarkdown && !mounted) setMounted(true);
	// }, [editorState.editingMarkdown]);

	const runOnCommad = (app: any) => {
		if (changeNumber === 0) {
			setChangeNumber((prev) => prev + 1);
			return;
		}
		if (!Object.hasOwn(blogState.canvasApps, canvasImageName)) {
			dispatch({
				type: "set canvas apps",
				payload: { [canvasImageName]: app },
			});
		}
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
						setApp(app);

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
								.then((val: any) => {
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
