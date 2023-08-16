import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import React from "react";

function DraftPreviewLayout({ children }: { children: React.ReactNode }) {
	return <BlogContextProvider>{children}</BlogContextProvider>;
}

export default DraftPreviewLayout;
