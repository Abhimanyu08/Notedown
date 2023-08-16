"use client";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import React from "react";

function DraftLayout({ children }: { children: React.ReactNode }) {
	return <BlogContextProvider>{children}</BlogContextProvider>;
}

export default DraftLayout;
