import React from "react";
import Image from "next/image";
import searchGif from "../../../public/search.gif";
import { FcSearch } from "react-icons/fc";

function SearchDemo() {
	return (
		<div className="flex mt-20 items-center transparent">
			<div className="w-fit border-black border-2 rounded-md ml-10">
				<Image
					src={searchGif.src}
					width={651}
					height={374}
					layout="fixed"
				/>
			</div>
			<div className="flex gap-2 items-center text-3xl font-bold text-white mx-auto h-fit">
				<FcSearch />
				<span>
					<span className="text-blue-500">Search</span> through all
					the posts to find what you need
				</span>
			</div>
		</div>
	);
}

export default SearchDemo;
