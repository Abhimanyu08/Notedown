"use client";
import useShortCut from "@/hooks/useShortcut";
import { StateEffect } from "@codemirror/state";
import { Blog } from "@components/BlogPostComponents/Blog";
import { Toc } from "@components/BlogPostComponents/TableOfContents";
import { vim } from "@replit/codemirror-vim";
import getExtensions from "@utils/getExtensions";
import { useContext, useEffect } from "react";
import BlogContextProvider, {
	BlogContext,
} from "../apppost/components/BlogState";
import { convertMarkdownToContent } from "../utils/convertMarkdownToContent";
import { EditorContext } from "./components/EditorContext";
import EditorToolbar from "./components/EditorToolbar";
import MarkdownEditor from "./components/MarkdownEditor";
import BlogLayout from "./components/BlogLayout";

function Write() {
	return <BlogLayout />;
}

export default Write;
