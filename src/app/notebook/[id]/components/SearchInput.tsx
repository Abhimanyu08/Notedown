"use client";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function SearchInput() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const [query, setQuery] = useState(searchParams?.get("q") || "");
	function getSearchUrl(query: string) {
		return (
			pathname +
			`?q=${query}` +
			(searchParams?.has("searchtag")
				? `&searchtag=${searchParams?.get("searchtag")}`
				: "")
		);
	}
	return (
		<form
			className="flex gap-2 px-6 items-center"
			action={(formData: FormData) => {
				const query = formData.get("query") as string;
				if (!query) return;

				router.push(getSearchUrl(query));
			}}
		>
			<Input
				type="text"
				name="query"
				placeholder="Search"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>

			<Button
				onClick={() => {
					router.push(getSearchUrl(query));
				}}
				variant={"ghost"}
				size={"sm"}
				className="h-8 rounded-full p-2"
			>
				<Search size={16} />
			</Button>

			{searchParams?.get("q") && (
				<ToolTipComponent tip="Clear search results" side="bottom">
					<Link href={pathname!} shallow>
						<Button
							variant={"ghost"}
							size={"sm"}
							className="h-8 rounded-full p-2"
						>
							<X size={16} />
						</Button>
					</Link>
				</ToolTipComponent>
			)}
		</form>
	);
}

export default SearchInput;
