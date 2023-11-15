"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
// import languages from "@utils/syntaxhighlighter/availableLanguages";

export function Combobox({
	items,
	type,
	value,
	setValue,
}: {
	items: string[];
	type: string;
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
}) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between bg-black text-gray-400"
				>
					{value ? value : `Select ${type}...`}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder={`Search ${type}...`} />
					<CommandEmpty>No {type} found.</CommandEmpty>
					<CommandGroup
						className="overflow-y-auto max-h-[160px]
					lg:scrollbar-thin 
				scrollbar-track-black 
				scrollbar-thumb-slate-700
					"
					>
						{items.map((item) => (
							<CommandItem
								key={item}
								onSelect={() => {
									setValue(item);
									setOpen(false);
								}}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										value === item
											? "opacity-100"
											: "opacity-0"
									)}
								/>
								{item}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
