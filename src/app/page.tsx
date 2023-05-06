import React from "react";
import LoomDemoModal from "@components/HomePageComponents/LoomDemoModal";
import { markdown } from "@codemirror/lang-markdown";
import AllScreenDemo from "@components/HomePageComponents/AllScreenDemo";
import DemoLabel from "@components/HomePageComponents/DemoLabel";
import DonationsComponent from "@components/HomePageComponents/DonationsComponent";
import HeaderText from "@components/HomePageComponents/HeaderText";
import MdToBlog from "@components/HomePageComponents/MdToBlogDemo";
import Link from "next/link";
import { AiFillRead } from "react-icons/ai";
import { FaPencilAlt } from "react-icons/fa";
import { SUPABASE_FILES_BUCKET } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";

async function Home() {
	return (
		<>
			<LoomDemoModal />
			<div
				className="flex gap-10 lg:gap-20 md:gap-14 flex-col pb-20 grow overflow-y-auto
				lg:scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-700
			"
			>
				<div className="self-center flex gap-10 font-semibold lg:text-xl text-black">
					<Link href="/read">
						<div className="cursor-pointer bg-amber-400 flex items-center gap-2 px-3 lg:px-4 py-1 lg:py-2 rounded-md  ">
							Read <AiFillRead size={24} />
						</div>
					</Link>
					<Link href="/edit">
						<div className="cursor-pointer px-3 lg:px-4 py-1 lg:py-2 rounded-md   flex items-center gap-2 bg-amber-400">
							Write <FaPencilAlt />
						</div>
					</Link>
				</div>
				<HeaderText />
				<DemoLabel />
				{/* <WriteEditDemo />
				<CanvasDemo />
				<SearchDemo /> */}
			</div>
		</>
	);
}

export default Home;
