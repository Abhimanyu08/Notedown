import { NotLoggedInOptions } from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";

async function Home() {
	return (
		<SideSheet>
			<NotLoggedInOptions className="mt-2" />
		</SideSheet>
	);
}

export default Home;
