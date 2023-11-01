"use client";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { NotLoggedInOptions } from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";
import { Button } from "@components/ui/button";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import Link from "next/link";
import { useContext, useEffect } from "react";
import { useSupabase } from "./appContext";
import { usePathname, useRouter } from "next/navigation";

function Home() {
	const { session } = useSupabase();
	const { documentDb } = useContext(IndexedDbContext);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!documentDb) return;

		const markdownObjectStore = getMarkdownObjectStore(
			documentDb,
			"readonly"
		);
		if (pathname === "/" && !session) {
			const countReq = markdownObjectStore.count();
			countReq.onsuccess = () => {
				if (countReq.result > 0) {
					router.push("/profile/anon");
				}
			};
		}
	}, [documentDb]);
	return (
		<>
			<SideSheet>
				<NotLoggedInOptions className="mt-2" />
			</SideSheet>
			<div
				className="self-center w-2/3 aspect-video overflow-hidden  my-auto border-border border-2 rounded-sm"
				id="demo-container"
			>
				<video className="w-full" controls>
					<source src="/demo.mp4" type="video/mp4" />
				</video>
			</div>
			<div className="flex self-center gap-10 my-auto">
				<Link href="/write">
					<Button className="w-40 bg-gray-200 hover:bg-gray-500">
						Start Writing
					</Button>
				</Link>
			</div>
		</>
	);
}

export default Home;
