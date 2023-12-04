"use client";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Input } from "@components/ui/input";
import Link from "next/link";
import {
	usePathname,
	useSearchParams,
	useRouter,
	useParams,
} from "next/navigation";
import React, { useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";

function SearchInput() {
	const pathname = usePathname();
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	return (
		<form
			className="flex gap-2 px-6"
			action={(formData: FormData) => {
				const newEntry =
					pathname +
					`?q=${formData.get("query")}` +
					(searchParams?.toString() &&
						`&${searchParams?.toString()}`);

				router.push(newEntry);
			}}
		>
			<Input type="text" name="query" placeholder="Search" />

			{searchParams?.get("q") && (
				<ToolTipComponent tip="Clear search results" side="bottom">
					<Link href={pathname!} shallow>
						<AiFillCloseCircle size={20} />
					</Link>
				</ToolTipComponent>
			)}
		</form>
	);
}

export default SearchInput;
