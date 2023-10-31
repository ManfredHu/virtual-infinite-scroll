import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import React, { useState } from "react";
import { json } from "@remix-run/node";
export const meta: MetaFunction = () => {
  return [
    { title: "无限翻页滚动" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const PAGE_SIZE = 10; // 每次加载的数据项数量
const data = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);

export let loader: LoaderFunction = async ({ request }) => {
  const page = Number(new URL(request.url).searchParams.get("page")) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  // 模拟数据源，您可以替换为实际的数据加载逻辑
  const data = Array.from({ length: 1000 }, (_, index) => `Item ${index + 1}`);

  const items = data.slice(start, end);

  return json({ items, page });
};

export default function InfiniteScroll(props: LoaderFunction) {
  const { items, page } = props;

  return (
    <div>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <button onClick={() => loadMore(page + 1)}>Load More</button>
    </div>
  );
}

async function loadMore(page) {
  // 使用 Remix 的 `fetch` 函数加载更多数据
  const response = await fetch(`/infinite-scroll?page=${page}`);
  const data = await response.json();
  const newItems = data.items;

  // 将新数据追加到现有列表
  const list = document.querySelector('ul');
  newItems.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
}
