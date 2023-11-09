"use client";
import {
	LoggedInOptions,
	NotLoggedInOptions,
} from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";
import { Button } from "@components/ui/button";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import Link from "next/link";
import { useContext, useEffect } from "react";
import { useSupabase } from "./appContext";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
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
			{/* <SideSheet
				notLoggedInChildren={<NotLoggedInOptions />}
				loggedInChildren={<LoggedInOptions />}
			/> */}

			<div className="flex flex-col h-full w-full justify-between p-10 self-center">
				<div className="self-center text-center">
					<h1 className="text-3xl">
						A simple markdown based note-taking app with useful
						embeddings :)
					</h1>
					<p className="w-full text-sm mt-4 text-gray-400">
						Your notes will be stored locally in your browser. Only
						upload when you need to sync across devices or share
						them with someone
					</p>
				</div>
				<div
					className="self-center w-1/2 aspect-video overflow-hidden border-border border-2 rounded-sm"
					id="demo-container"
				>
					<iframe
						src="https://www.youtube.com/embed/4efWE1K2WuM?si=GqsZDr-DkmnE1reK"
						title="YouTube video player"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						className="w-full h-full"
					></iframe>
				</div>
				<div className="flex self-center">
					<Link href="/write">
						<Button className="w-40 bg-gray-200 hover:bg-gray-500">
							Start Writing
						</Button>
					</Link>
				</div>
			</div>
		</>
	);
}

export default Home;
