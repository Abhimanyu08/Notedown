import { NotLoggedInOptions } from "@components/Navbar/Options";
import { Sheet, SheetContent, SheetTrigger } from "@components/ui/sheet";
import { RxHamburgerMenu } from "react-icons/rx";

async function Home() {
	return (
		<>
			<Sheet>
				<SheetTrigger className="absolute top-4 left-4">
					<button>
						<RxHamburgerMenu />
					</button>
				</SheetTrigger>
				<SheetContent side={"left"}>
					Login using:
					<NotLoggedInOptions className="mt-2" />
				</SheetContent>
			</Sheet>
		</>
	);
}

export default Home;
