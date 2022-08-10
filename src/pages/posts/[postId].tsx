import { PostgrestError } from "@supabase/supabase-js";
import { GetServerSideProps } from "next";
import { createContext, useEffect, useState } from "react";
import { SUPABASE_POST_TABLE } from "../../../utils/constants";
import { getPostContent } from "../../../utils/getResources";
import htmlToJsx from "../../../utils/htmlToJsx";
import sendRequest from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import Layout from "../../components/Layout";
import Post from "../../interfaces/Post";

interface PostProps {
	title: string;
	description: string;
	content: string;
	language: string;
}

interface PostQueryResult {
	data: Post[] | null;
	error: PostgrestError | null;
}

export const PostContext = createContext<Record<number, string>>({});

export default function Blog({
	title,
	description,
	content,
	language,
}: PostProps) {
	const [containerId, setContainerId] = useState<string | null>(null);
	const [child, setChild] = useState<JSX.Element | null>(null);
	const [runTillThisBlock, setRunTillThisBlock] = useState<
		((blockNumber: number) => void) | null
	>(null);
	const [blockToOutput, setBlockToOutput] = useState<Record<number, string>>({
		3: "4",
	});

	//prepare the container
	// useEffect(() => {
	// 	if (!containerId) prepareContainer(language);
	// }, []);

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
		setRunTillThisBlock(() => func);
	});

	useEffect(() => {
		// if (containerId)
		setChild(
			htmlToJsx({
				html: content,
				language,
				containerId: "lol",
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
			<Layout>
				<div className="w-4/5 md:w-3/5 mx-auto text-left text-white">
					<h1 className="text-4xl font-bold text-center w-full">
						{title}
					</h1>
					<p className="mt-4 italic text-center">{description}</p>
					<div className="mt-10">
						{child ? child : <p>Loading...</p>}
					</div>
				</div>
			</Layout>
		</PostContext.Provider>
	);
}

export const getServerSideProps: GetServerSideProps<
	PostProps,
	{ postId: string }
> = async (context) => {
	const defaultReturn = {
		props: {
			title: "",
			language: "",
			content: "",
			description: "",
		},
	};
	const { data, error }: PostQueryResult = await supabase
		.from(SUPABASE_POST_TABLE)
		.select("filename")
		.eq("id", context.params?.postId);

	if (error || !data || data.length === 0) {
		console.log(error);
		return defaultReturn;
	}

	const postContent = await getPostContent(data.at(0)!.filename!);
	return {
		props: {
			...postContent,
		},
	};
};
