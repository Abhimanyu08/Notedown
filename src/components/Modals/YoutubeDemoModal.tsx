import React, { useState } from "react";
import getYoutubeEmbedLink from "../../../utils/getYoutubeEmbedLink";

function YoutubeDemoModal() {
	const [show, setShow] = useState(false);
	return (
		<>
			<input
				type="checkbox"
				id="youtube-demo"
				checked={show}
				onChange={(e) => setShow(e.target.checked)}
				className="hidden"
			/>
			<label
				className={` text-black ${
					show ? "" : "hidden"
				} absolute top-0 left-0 flex w-full h-full items-center justify-center z-50 bg-slate-800/80`}
				htmlFor="youtube-demo"
			>
				<div className="lg:w-2/3 w-full demo">
					<iframe
						className="w-full h-full"
						src={getYoutubeEmbedLink(
							"https://www.youtube.com/watch?v=ZuLn42merAg"
						)}
						title="YouTube video player"
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					></iframe>
				</div>
			</label>
		</>
	);
}

export default YoutubeDemoModal;
