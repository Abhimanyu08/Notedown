import { PostgrestError, User } from "@supabase/supabase-js";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { SUPABASE_POST_TABLE } from "../../../utils/constants";
import { getPostContent } from "../../../utils/getResources";
import htmlToJsx from "../../../utils/htmlToJsx";
import sendRequest from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import Layout from "../../components/Layout";
import Post from "../../interfaces/Post";
import { UserContext } from "../_app";

interface PostProps extends Post {
	content: string;
	loggedInUser: User | null;
}

interface PostQueryResult {
	data: Post[] | null;
	error: PostgrestError | null;
}

export const BlogContext = createContext<Record<number, string>>({});

export default function Blog({
	title,
	description,
	content,
	language,
	loggedInUser,
}: PostProps) {
	const router = useRouter();
	const [containerId, setContainerId] = useState<string | null>(null);
	const [child, setChild] = useState<JSX.Element | null>(null);
	const [runTillThisBlock, setRunTillThisBlock] = useState<
		((blockNumber: number) => void) | null
	>(null);
	const [blockToOutput, setBlockToOutput] = useState<Record<number, string>>({
		3: "4",
	});
	const { user: contextUser } = useContext(UserContext);
	const [user, setUser] = useState(loggedInUser);

	useEffect(() => {
		if (contextUser) {
			setUser(contextUser);
		}
		if (!loggedInUser && !contextUser) {
			setUser(null);
		}
	}, [loggedInUser, contextUser]);

	useEffect(() => {
		const prepareContainer = async (language: string) => {
			const resp = await sendRequest("POST", {
				language,
			});

			if (resp.status !== 201) {
				console.log(resp.statusText);
				return;
			}
			const body: { containerId: string } = await resp.json();
			setContainerId(body.containerId);
		};
		if (!containerId && language) prepareContainer(language);
	}, []);

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
			runCodeRequest(code, blockNumber, containerId);
		};
		setRunTillThisBlock(() => func);
	});

	useEffect(() => {
		if (containerId)
			setChild(
				htmlToJsx({
					html: content,
					language: language!,
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
			{ language: language!, containerId, code },
		];
		const resp = await sendRequest(...params);

		if (resp.status === 500) {
			setBlockToOutput({ [blockNumber]: resp.statusText });
			return;
		}
		const { output } = (await resp.json()) as { output: string };
		setBlockToOutput({ [blockNumber]: output });
	};

	return (
		<BlogContext.Provider value={blockToOutput}>
			<Layout
				user={user}
				route={router.asPath}
				logoutCallback={() => setUser(null)}
			>
				<div className="w-4/5 xl:w-4/5 mx-auto text-left text-white">
					<h1 className="text-4xl font-bold text-center w-full">
						{title}
					</h1>
					<p className="mt-4 italic text-center">{description}</p>
					<div className="mt-10">
						{child ? child : <p>Loading...</p>}
					</div>
				</div>
			</Layout>
		</BlogContext.Provider>
	);
}

export const getServerSideProps: GetServerSideProps<
	PostProps,
	{ postId: string }
> = async (context) => {
	const { user } = await supabase.auth.api.getUserByCookie(context.req);
	supabase.auth.session = () => ({
		access_token: context.req.cookies["sb-access-token"] || "",
		token_type: "bearer",
		user,
	});
	const defaultReturn = {
		props: {
			title: "",
			language: "",
			content: "",
			description: "",
			loggedInUser: user,
		},
	};
	const { data, error }: PostQueryResult = await supabase
		.from(SUPABASE_POST_TABLE)
		.select("title, description, language, filename")
		.eq("id", context.params?.postId);

	if (error || !data || data.length === 0) {
		console.log(error);
		return defaultReturn;
	}
	const { title, description, language, filename } = data.at(0) as Post;
	const { content } = await getPostContent(filename!);
	return {
		props: {
			title,
			language,
			description,
			content,
			loggedInUser: user,
		},
	};
};
