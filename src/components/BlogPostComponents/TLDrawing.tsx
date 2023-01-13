import React, { useContext, useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

import { Tldraw } from "@tldraw/tldraw";
import { SUPABASE_IMAGE_BUCKET } from "../../../utils/constants";
import { CanvasImageContext } from "../../pages/_app";

function TLDrawing({
	canvasImageName,
	imageFolder,
}: {
	canvasImageName: string;
	imageFolder?: string;
}) {
	const [app, setApp] = useState<any>();
	const [currentCanvasImageName, setCurrentCanvasImageName] =
		useState(canvasImageName);
	const { canvasImages, setCanvasImages } = useContext(CanvasImageContext);
	const [changeNumber, setChangeNumber] = useState(0);

	useEffect(() => {
		if (
			!app ||
			!canvasImageName ||
			!Object.hasOwn(canvasImages, currentCanvasImageName)
		)
			return;

		setCanvasImages((prev) => {
			if (canvasImageName === currentCanvasImageName) {
				return {
					...prev,
					[canvasImageName]: app,
				};
			}
			return {
				...prev,
				[canvasImageName]: app,
				[currentCanvasImageName]: null,
			};
		});
		setCurrentCanvasImageName(canvasImageName);
	}, [canvasImageName]);

	const runOnCommad = (canvasImageName: string) => {
		if (changeNumber === 0) {
			setChangeNumber((prev) => prev + 1);
			return;
		}
		setCanvasImages((prev) => ({ ...prev, [canvasImageName]: app }));
	};

	return (
		<>
			<div className="relative w-full aspect-[4/3] self-center not-prose">
				<Tldraw
					showMenu={false}
					showMultiplayerMenu={false}
					showPages={false}
					autofocus={false}
					disableAssets={true}
					onMount={(app) => {
						if (imageFolder && canvasImageName) {
							supabase.storage
								.from(SUPABASE_IMAGE_BUCKET)
								.download(
									`${imageFolder}/${canvasImageName}.png`
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
						setApp(app);
					}}
					onCommand={() => runOnCommad(canvasImageName)}
				/>
			</div>
		</>
	);
}

export default TLDrawing;
