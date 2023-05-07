import Link from "next/link";
import { NavbarClientComponent } from "./NavbarClientComponent";

function Navbar() {
	return (
		<div className="flex items-center p-3 md:p-4 justify-between grow-0 mb-5 lg:mb-5 lg:mx-52 z-10 opacity-100  border-white/25 font-semibold md:font-bold relative md:text-base text-sm text-black dark:text-white">
			<div className="flex gap-6 md:gap-14">
				<Link href="/">
					<p className="link-hover cursor-pointer">Home</p>
				</Link>
				<Link href="/posts/597">
					<p className="link-hover cursor-pointer">About</p>
				</Link>
			</div>
			<NavbarClientComponent />
		</div>
	);
}

export const OptionsComponent = ({ children }: { children: JSX.Element[] }) => {
	return (
		<div className="flex flex-col absolute top-8 right-10  p-4 rounded-md bg-black shadow-sm shadow-white gap-4">
			{children}
		</div>
	);
};

export default Navbar;
