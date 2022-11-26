import React from "react";
import Image from "next/image";
import searchGif from "../../../public/search.gif";
import { FcSearch } from "react-icons/fc";
import DemoContainer from "./DemoContainer";

function SearchDemo() {
	return (
		<DemoContainer>
			<div className="flex gap-2 items-start text-3xl font-bold text-white h-fit w-1/3">
				<FcSearch size={40} />
				<span>
					<span className="text-blue-500">Search</span> through all
					the posts to find what you need
				</span>
			</div>
			<div className="w-fit border-blue-400 drop-shadow-blue border-2 rounded-md flex">
				<Image
					src={searchGif.src}
					width={651}
					height={374}
					layout="fixed"
				/>
			</div>
		</DemoContainer>
	);
}

export default SearchDemo;
