"use client";
import {
	LoggedInOptions,
	NotLoggedInOptions,
} from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";
import { Button } from "@components/ui/button";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useSupabase } from "./appContext";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { usePathname, useRouter } from "next/navigation";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import Script from "next/script";

const videoCheckpoints: { title: string; content: string; time: number }[] = [
	{ title: "Write notes using markdown", content: "", time: 0 },
	{ title: "Write and run code", content: "", time: 12 },
	{ title: "Draw diagrams using tldraw", content: "", time: 35 },

	{ title: "Embed CodeSandbox", time: 55, content: "" },
	{
		title: "Code snippets",
		content: "",
		time: 70,
	},
	{
		title: "Add Images",
		content: "",
		time: 88,
	},
	{
		title: "All your notes are organized by tags",
		content:
			"Steven Paul Jobs (February 24, 1955 – October 5, 2011) was an American business magnate, inventor, and investor best known as the co-founder of Apple. Jobs was also chairman and majority shareholder of Pixar, and the founder of NeXT. He was a pioneer of the personal computer revolution of the 1970s and 1980s, along with his early business partner and fellow Apple co-founder Steve Wozniak. Steven Paul Jobs (February 24, 1955 – October 5, 2011) was an American business magnate, inventor, and investor best known as the co-founder of Apple. Jobs was also chairman and majority shareholder of Pixar, and the founder of NeXT. He was a pioneer of the personal computer revolution of the 1970s and 1980s, along with his early business partner and fellow Apple co-founder Steve Wozniak.",
		time: 128,
	},
];

function Home() {
	const [ytplayer, setPlayer] = useState<any>();

	useEffect(() => {
		let player; // Define the player variable

		// Callback function called when the API is ready
		(window as any).onYouTubeIframeAPIReady = () => {
			// Initialize and create the YouTube player
			player = new (window as any).YT.Player("demo", {
				videoId: "Uz4LdXfLims", // Replace with your video's ID
				playerVars: {
					// Any additional player parameters can be added here
				},
				events: {
					// You can define event handlers here (e.g., onReady, onStateChange)
				},
			});

			setPlayer(player);

			// You can access the player object here for further control
		};
	}, []);
	// const { session } = useSupabase();
	// const { documentDb } = useContext(IndexedDbContext);
	// const router = useRouter();
	// const pathname = usePathname();

	// useEffect(() => {
	// 	if (!documentDb) return;

	// 	const markdownObjectStore = getMarkdownObjectStore(
	// 		documentDb,
	// 		"readonly"
	// 	);
	// 	if (pathname === "/" && !session) {
	// 		const countReq = markdownObjectStore.count();
	// 		countReq.onsuccess = () => {
	// 			if (countReq.result > 0) {
	// 				router.push("/profile/anon");
	// 			}
	// 		};
	// 	}
	// }, [documentDb]);

	return (
		<>
			<div className="flex flex-col h-full w-full justify-between p-10 self-center">
				<div className="self-center text-center">
					<h1 className="text-3xl">
						A simple markdown based note-taking app with useful
						embeddings :)
					</h1>
					{/* <p className="w-full text-sm mt-4 text-gray-400">
						Your notes will be stored locally in your browser. Only
						upload when you need to sync across devices or share
						them with someone
					</p> */}
				</div>
				<div className="flex w-full grow overflow-hidden items-center justify-center">
					<div className="flex flex-col py-10 items-start max-h-full overflow-y-auto basis-2/5">
						<Accordion type="single" collapsible className="w-2/3 ">
							{videoCheckpoints.map(
								({ title, content, time }) => {
									return (
										<>
											<AccordionItem
												value={title}
												onClick={() =>
													ytplayer.seekTo(time, true)
												}
												className="border-0 w-fit features"
											>
												<AccordionTrigger className="text-sm italic text-left text-gray-400">
													{title}
												</AccordionTrigger>
												<AccordionContent>
													{content}
												</AccordionContent>
											</AccordionItem>
										</>
									);
								}
							)}
						</Accordion>

						{/* <p>Draw diagrams using tldraw</p>
						<p>Embed Code Sandbox</p>
						<p>Add Images</p>
						<p>Non-executable code snippets</p> */}
					</div>
					<div
						className="self-center basis-3/5 aspect-video overflow-hidden border-border border-2 rounded-sm"
						id="demo-container"
					>
						<iframe
							id="demo"
							src="https://www.youtube.com/embed/Uz4LdXfLims?enablejsapi=1"
							title="YouTube video player"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							className="h-full w-full"
						></iframe>
					</div>
				</div>
				<div className="flex self-center items-center gap-2">
					<Link href="/write">
						<Button className="w-40 bg-gray-200 hover:bg-gray-500">
							Start Writing
						</Button>
					</Link>
					<span>Or</span>
					<Link href="/post/demo">
						<Button className="w-fit bg-gray-200 hover:bg-gray-500">
							View a sample note
						</Button>
					</Link>
				</div>
			</div>
		</>
	);
}

// function Feature({
// 	title,
// 	content,
// 	value,
// 	onClick
// }: {
// 	title: string;
// 	content: string;
// 	value: string;
// 	onClick: () => void
// }) {
// 	return (
// 		<AccordionItem value={value} onClick={onClick}>
// 			<AccordionTrigger className="text-lg italic">
// 				{title}
// 			</AccordionTrigger>
// 			<AccordionContent>{content}</AccordionContent>
// 		</AccordionItem>
// 	);
// }

// function Runcode({}:{}) {
// 	return (
// 		<Feature
// 			title={"Write and run code"}
// 			content={"Yes.It adheres to the WAI-ARIA design pattern"}
// 			value="item-1"
// 		/>
// 	);
// }
// function Draw() {
// 	return (
// 		<Feature
// 			title={"Draw diagrams using tldraw"}
// 			content={"Yes.It adheres to the WAI-ARIA design pattern"}
// 			value="item-2"
// 		/>
// 	);
// }
// function Sandbox() {
// 	return (
// 		<Feature
// 			title={"Embed code sandboxed"}
// 			content={"Yes.It adheres to the WAI-ARIA design pattern"}
// 			value="item-3"
// 		/>
// 	);
// }
// function AddImages() {
// 	return (
// 		<Feature
// 			title={"Add Images"}
// 			content={"Yes.It adheres to the WAI-ARIA design pattern"}
// 			value="item-4"
// 		/>
// 	);
// }

// function Codesnippets() {
// 	return (
// 		<Feature
// 			title={"Code snippets"}
// 			content={"Yes.It adheres to the WAI-ARIA design pattern"}
// 			value="item-5"
// 		/>
// 	);
// }

export default Home;
