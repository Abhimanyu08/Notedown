import { User } from "@supabase/supabase-js";
import React from "react";
import Navbar from "./Navbar";

function BlogLayout({ children }: { children: JSX.Element[] | JSX.Element }) {
	return <div className="grow flex flex-row min-h-0">{children}</div>;
}

export default BlogLayout;
