import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { FormEventHandler, MouseEventHandler } from "react";
import Layout from "../components/Layout";
import { getAllPostTitles } from "../../utils/getResources";
import { supabase } from "../../utils/supabaseClient";

const SUPABASE_BUCKET_NAME = "blog-files";

interface HomeProps {
	titles: string[];
}
const Home: NextPage<HomeProps> = ({ titles }) => {
	const onUpload: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();

		const fileList = (
			e.currentTarget.elements.namedItem("file") as HTMLInputElement
		).files;
		if (!fileList || fileList.length === 0) {
			alert("Please upload a file");
			return;
		}

		const file = fileList[0];
		const fileName = file.name;
		const fileExtension = fileName.split(".").pop();
		if (fileExtension !== "md") {
			alert("Please upload a markdown file");
			return;
		}

		let { error } = await supabase.storage
			.from(SUPABASE_BUCKET_NAME)
			.upload(fileName, file);
		if (error) {
			alert(error.message);
			return;
		}

		alert("file uploaded successfully");
	};
	return (
		<Layout>
			<div className="flex flex-col">
				{titles.map((title) => (
					<Link key={title} href={`/posts/${title}`}>
						{title}
					</Link>
				))}
			</div>
			<form action="" onSubmit={onUpload}>
				<label htmlFor="fileInput">Upload new file</label>
				<input type="file" name="file" id="fileInput" />
				<button type="submit">Upload</button>
			</form>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
	const titles = getAllPostTitles();
	return {
		props: {
			titles,
		},
	};
};

export default Home;
