"use client";
import useOwner from "@/hooks/useOwner";
import React from "react";

function OwnerOnlyStuff({ children }: { children: React.ReactNode }) {
	const owner = useOwner();

	if (!owner) return <></>;
	return <>{children}</>;
}

export default OwnerOnlyStuff;
