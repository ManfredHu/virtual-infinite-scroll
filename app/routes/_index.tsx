import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Navigation" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export let loader: LoaderFunction = async ({ request }) => {
  return {};
};

export default function Index() {
  return (
    <ul className="homePage">
      <li>
        <Link to="/virtual-scroll-list">虚拟滚动列表</Link>
      </li>
      <li>
        <Link to="/virtual-scroll-list-with-lazyloading">
          虚拟滚动列表+懒加载
        </Link>
      </li>
    </ul>
  );
}
