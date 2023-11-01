"use client";
import useShortCut from "@/hooks/useShortcut";
import { cn } from "@/lib/utils";
import {
	HeadingType,
	createHeadingIdFromHeadingText,
	mdToHast,
} from "@utils/html2Jsx/transformer";
import { motion, useScroll } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineMinus } from "react-icons/ai";
import { ToolTipComponent } from "./ToolTipComponent";

function BlogContainer({
	children,
	content,
	title,
}: React.ComponentPropsWithoutRef<"div"> & {
	content: string;
	title: string;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const breadcrumbRef = useRef<HTMLDivElement>(null);
	const [currHeadingIndex, setCurrHeadingIndex] = useState<number | null>(
		null
	);
	const [hide, setHide] = useState(false);
	const [startedScrolling, setStartedScrolling] = useState(false);
	const [headingList, setHeadingList] = useState<HeadingType[]>([]);
	const { scrollYProgress } = useScroll({ container: containerRef });
	useEffect(() => {
		if (!containerRef || !content) return;
		const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
		const { headingAST } = mdToHast(content);
		let { nameList, headingList: headinglist } =
			makeHeadingListFromAst(headingAST);
		setHeadingList(headinglist.slice(1));
		nameList = nameList.slice(1);
		// if (!headerElem) return;
		// setHeaderWidth(headerElem.clientWidth);
		let observer = new IntersectionObserver(
			(entries) => {
				let currentEntry: IntersectionObserverEntry | null = null;
				for (let entry of entries) {
					const { y } = entry.boundingClientRect;
					const { y: rootY } = entry.rootBounds!;
					if (y - rootY > 100) {
						continue;
					}

					currentEntry = entry;
				}

				if (currentEntry) {
					setCurrHeadingIndex((p) => {
						const newHeading = makeNameFromId(
							currentEntry?.target?.id || ""
						);
						if (
							newHeading === nameList[p!] &&
							currentEntry?.intersectionRatio === 1
						) {
							if (!p || p - 1 < 0) return null;
							return p! - 1;
						}
						let newIndex = nameList.indexOf(newHeading);
						return newIndex !== -1 ? newIndex : null;
					});
				}
			},
			{
				root: containerRef.current,
				threshold: 1,
			}
		);

		headings.forEach((hElem) => observer.observe(hElem));
	}, [content]);

	useShortCut({
		keys: ["H"],
		callback: () => setHide((p) => !p),
	});

	return (
		<motion.div
			className={`lg:basis-3/5 relative 
							overflow-y-auto

							basis-full
lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700 
				scroll-smooth
							`}
			ref={containerRef}
			onScroll={(e) => {
				if (e.currentTarget.scrollTop === 0) {
					if (startedScrolling) setStartedScrolling(false);
				}
				if (e.currentTarget.scrollTop > 0 && !startedScrolling) {
					setStartedScrolling(true);
				}
			}}
		>
			<>
				<motion.div
					className={cn(
						"fixed mx-auto top-8 bg-slate-800/50 rounded-sm flex justify-between items-center p-2 z-[300] ",
						"rounded-b-none ",
						startedScrolling && !hide ? "" : "invisible"
					)}
					ref={breadcrumbRef}
					style={
						containerRef.current
							? {
									width:
										(
											containerRef.current!.children.item(
												containerRef.current!.children
													.length - 1
											) as HTMLDivElement
										).clientWidth + 10,
									left:
										containerRef.current!.offsetLeft +
										(
											containerRef.current!.children.item(
												containerRef.current!.children
													.length - 1
											) as HTMLDivElement
										).offsetLeft -
										10,
							  }
							: {}
					}
				>
					<div className="text-sm font-serif basis-11/12 overflow-x-auto  text-gray-200/80 flex gap-2 w-max scrollbar-thin scrollbar-track-black scrollbar-thumb-slate-700">
						<a
							href="#title"
							className="hover:text-gray-100 shrink-0 hover:underline"
						>
							{title}
						</a>
						{/* <span>{">"}</span> */}
						{(currHeadingIndex !== null
							? headingItemToPath(headingList[currHeadingIndex])
							: []
						)?.map((v) => {
							return (
								<>
									<span>{">"}</span>
									<a
										href={
											"#" +
											createHeadingIdFromHeadingText(v)
										}
										className="hover:underline shrink-0 hover:text-gray-100 hover:underline-offset-2 decoration-1"
									>
										{v}
									</a>
								</>
							);
						})}
					</div>
					<ToolTipComponent
						tip="hide (H)"
						side="right"
						onClick={() => setHide(true)}
					>
						<AiOutlineMinus className="text-slate-100/60" />
					</ToolTipComponent>
				</motion.div>

				<motion.div
					className={cn(
						"fixed bg-slate-700 rounded-sm flex",
						breadcrumbRef.current && !hide && startedScrolling
							? ""
							: "hidden"
					)}
					style={
						containerRef.current
							? {
									width:
										(
											containerRef.current!.children.item(
												containerRef.current!.children
													.length - 1
											) as HTMLDivElement
										).clientWidth + 10,
									left:
										containerRef.current!.offsetLeft +
										(
											containerRef.current!.children.item(
												containerRef.current!.children
													.length - 1
											) as HTMLDivElement
										).offsetLeft -
										10,
									scaleX: scrollYProgress,
									height: "2px",
									transformOrigin: "0%",
									top: breadcrumbRef.current
										? breadcrumbRef.current!.offsetTop +
										  breadcrumbRef.current!.offsetHeight
										: "",
							  }
							: {}
					}
				></motion.div>
			</>
			{children}
		</motion.div>
	);
}

function makeHeadingListFromAst(headingAst: HeadingType) {
	let nameList = [headingAst.text];
	let headingList = [headingAst];
	if (headingAst.children.length === 0) {
		return { nameList, headingList };
	}
	for (let child of headingAst.children) {
		let { nameList: childNameList, headingList: childHeadingList } =
			makeHeadingListFromAst(child);
		nameList = nameList.concat(childNameList);
		headingList = headingList.concat(childHeadingList);
	}
	return { nameList, headingList };
}

function makeNameFromId(headingId: string) {
	return headingId.split("-").join(" ");
}

function headingItemToPath(headingItem: HeadingType) {
	let pathway = [];
	let currItem: HeadingType | null = headingItem;
	if (!currItem) return null;
	while (currItem && currItem.depth !== 0) {
		pathway.push(currItem?.text);
		currItem = currItem!.parent;
	}
	return pathway.reverse();
}

export default BlogContainer;
