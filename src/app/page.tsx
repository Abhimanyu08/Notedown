"use client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { IndexedDbContext } from "@/contexts/IndexedDbContext";
import { cn } from "@/lib/utils";
import { Button } from "@components/ui/button";
import { getMarkdownObjectStore } from "@utils/indexDbFuncs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { useSupabase } from "./appContext";

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
		let player: any;

		(window as any).onYouTubeIframeAPIReady = () => {
			player = new (window as any).YT.Player("demo", {
				videoId: "Uz4LdXfLims",
			});

			setPlayer(player);
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
					<h1 className="text-3xl text-indigo-400 font-bold">
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
					<div
						className="self-center basis-3/5 aspect-video border-[4px] border-gray-600 overflow-hidden rounded-md"
						id="demo-container"
					>
						<iframe
							id="demo"
							src="https://www.youtube.com/embed/Uz4LdXfLims?enablejsapi=1"
							title="YouTube video player"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							className="h-full w-full rounded-md"
						></iframe>
					</div>
					<div className="flex flex-col p-14  items-start max-h-full  basis-2/5 ">
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
													setTimeout(
														() => {
															setFeature(title);
															ytplayer.seekTo(
																time,
																true
															);
														},

														0
													);
												}}
												className="border-0 w-full features"
											>
												<AccordionTrigger
													className={cn(
														" text-left text-gray-200",
														feature === title
															? "text-lg italic font-semibold"
															: ""
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

export default Home;
