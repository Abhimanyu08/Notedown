import { NotLoggedInOptions } from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";
import { Button } from "@components/ui/button";
import Divider from "@components/ui/divider";
import Link from "next/link";

async function Home() {
	return (
		<>
			<SideSheet>
				<NotLoggedInOptions className="mt-2" />
			</SideSheet>
			<div className="flex self-center gap-10 my-auto">
				<NotLoggedInOptions className="w-40" />
				<Divider horizontal={false}></Divider>
				<div className="flex items-center justify-center gap-2 flex-col">
					<Link href="/write">
						<Button className="w-40 bg-gray-200 hover:bg-gray-500">
							Start Writing
						</Button>
					</Link>
					<span className="text-gray-400">without logging in</span>
				</div>
			</div>
		</>
	);
}

export default Home;
