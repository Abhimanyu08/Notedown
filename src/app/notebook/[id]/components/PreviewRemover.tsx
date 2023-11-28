"use client";
import { usePathname } from "next/navigation";
import React from "react";

function PreviewRemover({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	if (pathname?.startsWith("/notebook")) return null;
	return <>{children}</>;
}

export default PreviewRemover;
