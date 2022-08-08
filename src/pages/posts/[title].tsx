import { GetStaticPaths, GetStaticProps } from "next";
import { createContext, useEffect, useState } from "react";
// import Code from "../../components/Code";
import PostType from "../../../interfaces/PostType";
import { getAllPostTitles, getPostContent } from "../../../utils/getResources";
import htmlToJsx from "../../../utils/htmlToJsx";
import mdToHtml from "../../../utils/mdToHtml";
import sendRequest from "../../../utils/sendRequest";

export const PostContext = createContext<Record<number, string>>({});

export default function Post({ content, language }: PostType) {
	const [containerId, setContainerId] = useState<string | null>(null);
	const [child, setChild] = useState<JSX.Element | null>(null);
	const [runTillThisBlock, setRunTillThisBlock] = useState<
		((blockNumber: number) => void) | null
	>(null);
	const [blockToOutput, setBlockToOutput] = useState<Record<number, string>>(
		{}
	);

	//prepare the container
	useEffect(() => {
		if (!containerId) prepareContainer(language);
	}, []);

	//
	useEffect(() => {
		if (runTillThisBlock || !containerId) return;
		const func = (blockNumber: number) => {
			let code = "";
			for (let i = 1; i <= blockNumber; i++) {
				const elem = document.getElementById(
					`${i}`
				) as HTMLTextAreaElement | null;
				if (!elem) continue;
				code = code.concat(elem.value + "\n");
			}
			console.log(code);
			runCodeRequest(code, blockNumber, containerId);
		};
		setRunTillThisBlock(() => {
			return func;
		});
	});

	useEffect(() => {
		if (containerId)
			setChild(
				htmlToJsx({
					html: content,
					language,
					containerId,
					runTillThisPoint: runTillThisBlock,
				})
			);
	}, [containerId, runTillThisBlock]);

	const runCodeRequest = async (
		code: string,
		blockNumber: number,
		containerId: string
	) => {
		const params: Parameters<typeof sendRequest> = [
			"POST",
			"http://localhost:5000",
			{ language, containerId, code },
		];
		const resp = await sendRequest(...params);

		if (resp.status === 500) {
			setBlockToOutput({ [blockNumber]: resp.statusText });
			return;
		}
		const { output } = (await resp.json()) as { output: string };
		setBlockToOutput({ [blockNumber]: output });
	};

	const prepareContainer = async (language: string) => {
		const resp = await sendRequest("POST", "http://localhost:5000", {
			language,
		});

		if (resp.status !== 201) {
			console.log(resp.statusText);
			return;
		}
		const body: { containerId: string } = await resp.json();
		setContainerId(body.containerId);
	};

	return (
		<PostContext.Provider value={blockToOutput}>
			<div>{containerId && child ? child : <p>Loading...</p>}</div>
		</PostContext.Provider>
	);
}

export const getStaticProps: GetStaticProps<
	PostType,
	{ title: string }
> = async (context) => {
	const post = getPostContent(context.params!.title);
	return {
		props: {
			title: context.params!.title,
			language: post.language,
			content: await mdToHtml(post.content),
		},
	};
};

export const getStaticPaths: GetStaticPaths<{ title: string }> = () => {
	const titles = getAllPostTitles();

	return {
		paths: titles.map((title) => ({ params: { title } })),
		fallback: false,
	};
};
