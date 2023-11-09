import { LoaderFunction, json } from "@remix-run/node";
import { respWithPagination } from "~/server/pagination";

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page")) || 0;
  const pageSize = Number(searchParams.get("pageSize")) || 20;
  console.log('page', page, pageSize)
  return json(respWithPagination(page, pageSize), {
    status: 200,
  });
};
