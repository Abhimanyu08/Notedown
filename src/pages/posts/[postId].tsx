import { PostgrestError, User } from "@supabase/supabase-js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
	createContext,
	MouseEventHandler,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	SUPABASE_BUCKET_NAME,
	SUPABASE_POST_TABLE,
} from "../../../utils/constants";
import { getHtmlFromMarkdown } from "../../../utils/getResources";
import htmlToJsx from "../../../utils/htmlToJsx";
import sendRequest from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import Layout from "../../components/Layout";
import Post from "../../interfaces/Post";
import { UserContext, BlogContext } from "../_app";

interface PostProps extends Post {
	content: string;
	loggedInUser: User | null;
	filename: string;
	author: string;
}
interface PostWithAuthor extends Post {
	bloggers: { name: string };
}

interface PostQueryResult {
	data: Partial<PostWithAuthor>[] | null;
	error: PostgrestError | null;
}

export default function Blog({
	title,
	description,
	content,
	language,
	loggedInUser,
	filename,
	author,
}: Partial<PostProps>) {
	const router = useRouter();
	const [containerId, setContainerId] = useState<string | null>(null);
	const [collectCodeTillBlock, setCollectCodeTillBlock] =
		useState<(blockNumber: number) => void>();
	const [blockToOutput, setBlockToOutput] = useState<Record<number, string>>(
		{}
	);
	const [blockToCode, setBlockToCode] = useState<Record<number, string>>({});
	const [file, setFile] = useState<File | null>(null);
	const { user: contextUser } = useContext(UserContext);
	const [user, setUser] = useState(loggedInUser);
	const [runningCode, setRunningCode] = useState(false);
	const [runningBlock, setRunningBlock] = useState<number>();

	const blogJsx = useMemo(() => {
		if (!content) return <></>;
		return htmlToJsx({
			html: content,
			language: language!,
		});
	}, [content]);

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
		const func = (blockNumber: number) => {
			const event = new Event("focus");
			for (let i = 1; i < blockNumber; i++) {
				const elem = document.getElementById(
					`run-${i}`
				) as HTMLButtonElement | null;
				if (!elem) continue;
				elem.dispatchEvent(event);
			}
			setRunningBlock(blockNumber);
			setRunningCode(true);
		};
		setCollectCodeTillBlock(() => func);
	}, []);

	useEffect(() => {
		if (!runningCode || !runningBlock || !language || !containerId) return;
		const runCodeRequest = async (blockNumber: number) => {
			let code = Object.values(blockToCode).join("\n");

			const params: Parameters<typeof sendRequest> = [
				"POST",
				{ language, containerId, code },
			];
			const resp = await sendRequest(...params);

			if (resp.status !== 201) {
				setBlockToOutput({ [blockNumber]: resp.statusText });
				return;
			}
			const { output } = (await resp.json()) as { output: string };
			setBlockToOutput({ [blockNumber]: output });
			setBlockToCode({});
		};
		runCodeRequest(runningBlock).then(() => {
			setRunningBlock(undefined);
			setRunningCode(false);
		});
	}, [runningCode]);

	const onChangeFile: MouseEventHandler = async (e) => {
		e.preventDefault();
		if (!file || !filename) return;
		const { error } = await supabase.storage
			.from(SUPABASE_BUCKET_NAME)
			.update(filename, file);
		if (error) {
			alert("couldn't replace file");
			return;
		}
		setFile(null);
		router.replace(router.asPath);
	};

	return (
		<BlogContext.Provider
			value={{ blockToOutput, setBlockToCode, collectCodeTillBlock }}
		>
			<Head>
				<title>{title}</title>
				<meta name="author" content={author} />
				<meta name="description" content={description} />
				<meta name="keywords" content={language} />
			</Head>
			<Layout
				user={user || null}
				route={router.asPath}
				logoutCallback={() => setUser(null)}
			>
				{file ? (
					<>
						<div
							className="btn btn-sm capitalize"
							onClick={onChangeFile}
						>
							Upload {file.name}
						</div>
						<div
							className="btn btn-sm capitalize"
							onClick={() => setFile(null)}
						>
							Cancel
						</div>
					</>
				) : (
					<>
						<label
							htmlFor="change-file"
							className="btn btn-sm capitalize"
						>
							Change md file
						</label>
						<input
							type="file"
							className="hidden"
							id="change-file"
							onChange={(e) =>
								setFile(e.target.files?.item(0) || null)
							}
						/>
					</>
				)}
				<div
					className="mx-auto prose  max-w-none lg:w-5/6 xl:w-4/6 prose-headings:text-cyan-500 text-white prose-a:text-amber-400 prose-strong:text-amber-500
				prose-pre:m-0 prose-pre:p-0 
				"
				>
					<h1 className="text-center">{title}</h1>
					<p className="text-center italic">{description}</p>
					<div className="">{blogJsx}</div>
				</div>
			</Layout>
		</BlogContext.Provider>
	);
}

export const getServerSideProps: GetServerSideProps<
	Partial<PostProps>,
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
			filename: "",
			loggedInUser: user,
		},
	};
	const { data, error }: PostQueryResult = await supabase
		.from(SUPABASE_POST_TABLE)
		.select("title, description, language, filename, bloggers(name)")
		.eq("id", context.params?.postId);

	if (error || !data || data.length === 0) {
		console.log(error);
		return defaultReturn;
	}
	const { title, description, language, filename, bloggers } = data.at(0)!;
	const { data: fileData, error: fileError } = await supabase.storage
		.from(SUPABASE_BUCKET_NAME)
		.download(filename!);
	if (fileError || !fileData) {
		let content = "";
		return {
			props: {
				title,
				language,
				description,
				content,
				filename: filename!,
				loggedInUser: user,
			},
		};
	}
	let { content } = await getHtmlFromMarkdown(fileData!);
	return {
		props: {
			title,
			language,
			description,
			content,
			filename: filename!,
			loggedInUser: user,
			author: bloggers?.name,
		},
	};
};
