import DemoLabel from "@components/HomePageComponents/DemoLabel";
import HeaderText from "@components/HomePageComponents/HeaderText";
import LoomDemoModal from "@components/HomePageComponents/LoomDemoModal";
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import Link from "next/link";
import { FaPencilAlt } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";

async function Home() {
	return (
		<>
			<Sheet>
				<SheetTrigger className="absolute top-4 left-4">
					<button>
						<RxHamburgerMenu />
					</button>
				</SheetTrigger>
				<SheetContent side={"left"}>hello</SheetContent>
			</Sheet>
			<LoomDemoModal />
			<div
				className="flex gap-10 lg:gap-20 md:gap-14 flex-col pb-20 grow overflow-y-auto
				lg:scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-700
			"
			>
				<div className="self-center flex gap-10 font-semibold lg:text-xl text-black">
					<Link href="/write">
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
