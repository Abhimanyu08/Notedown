import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabaseClient";


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    supabase.auth.api.setAuthCookie(req, res)
}

export default handler