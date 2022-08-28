import { User } from "@supabase/supabase-js";
import React from "react";
import Navbar from "./Navbar";

function BlogLayout({ children }: { children: JSX.Element[] | JSX.Element }) {
	return <div className="flex flex-row justify-end">{children}</div>;
}

export default BlogLayout;
