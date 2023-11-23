import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { cookies } from "next/headers";
import { createClient } from "redis";

let client: Awaited<
	ReturnType<ReturnType<typeof createClient>["connect"]>
> | null = null;

export async function POST(request: Request) {

	const host = request.headers.get("host")

	if (!host?.startsWith("localhost")) {

		const supabase = createSupabaseServerClient(cookies);
		const { data } = await supabase.auth.getUser();

		const userId = data.user?.id;

		if (!userId) {
			return Response.json("Please log in to execute code", {
				status: 400,
			});
		}

		if (!client) {
			client = await createClient({
				password: "QL1G0oh46tit5KRMGIu9Eug1wBHhQHUu",
				socket: {
					host: "redis-17180.c264.ap-south-1-1.ec2.cloud.redislabs.com",
					port: 17180,
				},
			}).connect();
		}

		const rateLimitKey = `rateLimit:${userId}`;

		const redisResp = await client.get(rateLimitKey);

		if (redisResp) {
			const requestsTillNow = parseInt(redisResp);
			if (requestsTillNow === 5) {
				return Response.json("Rate limit exceeded, Maximum 5 requests every 15 seconds", {
					status: 429,
					headers: {
						"X-RateLimit-Limit": "5",
						"X-RateLimit-Remaining": "0",
					},
				});
			}

			client.set(rateLimitKey, requestsTillNow + 1, { EX: 15 });
		} else {
			client.set(rateLimitKey, 1, { EX: 15 });
		}
	}

	const bodyToSend = await request.json();

	const controller = new AbortController();
	setTimeout(() => controller.abort(), 5000);

	const resp = await fetch(process.env.NEXT_PUBLIC_DOCKER_SERVER!, {
		method: request.method,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(bodyToSend),
		signal: controller.signal
	}).catch((err) => err.message);

	if (resp === "This operation was aborted") {

		return new Response("This request took too long to run, aborting", {
			status: 504,
		});
	}

	const body = await resp.json();


	if (!body) {
		return new Response(resp.statusText, {
			status: resp.status,
			headers: { "content-type": "application/json" },
		});
	}

	return new Response(JSON.stringify(body), {
		status: resp.status,
		headers: { "content-type": "application/json" },
	});
}

export async function DELETE(request: Request) {

	const bodyToSend = await request.json();
	fetch(process.env.NEXT_PUBLIC_DOCKER_SERVER!, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(bodyToSend),
	});

	return new Response("", { status: 200 })

}