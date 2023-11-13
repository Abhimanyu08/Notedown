"use client";
import {
	LoggedInOptions,
	NotLoggedInOptions,
} from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";
import { Button } from "@components/ui/button";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";

const videoCheckpoints: { title: string; content: string; time: number }[] = [
	{
		title: "Write notes using markdown",
		content:
			"Write notes using all the markdown goodness. Fill in the relevant metadata in the frontmatter. Add tags to organize notes. Add a programming language that you will use in your executable code blocks (explained below) using the language field. The available languages are javascript, python, rust and go. The slug field is relevant only if you choose to upload your note. Your note (it's markdown, images you upload etc) will be stored entirely locally by default.",
		time: 0,
	},
	{
		title: "Write and run code",
		content:
			"The code written inside usual markdown code blocks delimited by ``` can be edited and executed right in the browser. The environment in which they run is determined by the value of language field you provided in the frontmatter for eg if language is 'javascript', the code will run inside a node environment. The code inside every codeblock is written to the file whose filename is determined by the file parameter you provide in markdown (main by default) for eg code inside codeblock starting with ```file=foo will be written to 'foo.js'. Running a code block writes the code to it's respective file, executes that file and returns back the result in the terminal.",
		time: 12,
	},
	{
		title: "Draw diagrams using tldraw",
		content:
			"Embed a tldraw whiteboard (or blackboard) in your notes. Your drawings will be converted to a svg on preview",
		time: 35,
	},

	{
		title: "Embed CodeSandbox",
		time: 55,
		content:
			"Embed a Codesandbox in your note. You can configure template, editorHeight, themes, file etc using the ugly json editor that comes up, hit 'Generate Sandbox' (or press shift-enter) to generate a sandbox using the given config. The changes you make to the sandbox files will persist.",
	},
	{
		title: "Code snippets",
		content:
			"Select from dozens of languages and your desired theme for normal code blocks for proper syntax highlighting.",
		time: 70,
	},
	{
		title: "Add Images",
		content:
			"Add Images from your local filesystem. If you upload multiple images, they'll be rendered as a carousel. You can provide a caption for each one by using `;` as the separator in markdown like so:" +
			`![caption 1; caption 2; caption 3](image1, image2, image3)`,
		time: 88,
	},
	{
		title: "All your notes are organized by tags",
		content:
			"All your notes will be visible from your home page seperated by tags. The tags act loosely as a folder here, with each note being a file. A note can have multiple tags, therefore, it will be visible under each of it's tag.",
		time: 128,
	},
	{
		title: "Upload your note to sync across devices",
		content:
			"Every note you write is entirely local by default, including it's markdown, images. You only need to upload it if you want to sync your note across devices. Uploaded notes stay private by default, i.e only you can access them on any device (after signing in) at the url /post/private/[slug]. You can choose to publish if you want to allow others access to your note. Once public, your note will be available for anyone to read at /post/[slug]",
		time: 154,
	},
];

function Home() {
	const [ytplayer, setPlayer] = useState<any>();
	const [feature, setFeature] = useState(videoCheckpoints[0].title);

	const interval = useMemo(() => {
		if (!ytplayer) return;
		setInterval(() => {
			const time = ytplayer.getCurrentTime();
			const featureOnDisplay = videoCheckpoints.find((f, i) => {
				const previousTime = f.time;
				const nextTime =
					videoCheckpoints.at(i + 1)?.time ||
					Number.POSITIVE_INFINITY;
				return time >= previousTime && time < nextTime;
			})!;

			setFeature(featureOnDisplay.title);
		}, 1000);
	}, [ytplayer]);

	useEffect(() => {
		let player: any; // Define the player variable

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
			<div className="flex flex-col h-full w-full justify-between p-10 self-center">
				<div className="self-center text-center">
					<h1 className="text-3xl">
						A simple **markdown** based _note-taking app_ with
						useful embeddings :)
					</h1>
					{/* <p className="w-full text-sm mt-4 text-gray-400">
						Your notes will be stored locally in your browser. Only
						upload when you need to sync across devices or share
						them with someone
					</p> */}
				</div>
				<div className="flex w-full grow overflow-hidden items-center justify-center">
					<div className="flex flex-col p-10 items-start max-h-full  basis-2/5">
						<Accordion
							type="single"
							collapsible
							className="w-full overflow-y-auto p-5"
							value={feature}
						>
							{videoCheckpoints.map(
								({ title, content, time }) => {
									return (
										<>
											<AccordionItem
												value={title}
												onClick={() => {
													setFeature(title);
													setTimeout(
														() =>
															ytplayer.seekTo(
																time,
																true
															),
														0
													);
												}}
												className="border-0 w-full features"
											>
												<AccordionTrigger
													className={cn(
														" text-left ",
														feature === title
															? "text-gray-200 text-lg italic font-semibold"
															: "text-gray-400"
													)}
												>
													{title}
												</AccordionTrigger>
												<AccordionContent className="text-gray-400 font-normal text-base leading-7">
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
