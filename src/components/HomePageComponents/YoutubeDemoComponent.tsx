import React from "react";
import { AiFillYoutube } from "react-icons/ai";
function YoutubeDemoComponent() {
	return (
		<label
			className="flex self-center items-center gap-2 rounded-xl bg-black text-gray-200 px-3 py-1 trial-4"
			htmlFor="youtube-demo"
		>
			<span>Watch a quick demo on Youtube</span>
			<AiFillYoutube size={32} className="text-red-500" />
		</label>
	);
}

export default YoutubeDemoComponent;
