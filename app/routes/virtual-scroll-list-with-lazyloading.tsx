import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import Loading from "~/components/loading";
import { Resp, respWithPagination } from "~/server/pagination";
import "../style/index.css";

export const meta: MetaFunction = () => {
  return [
    { title: "虚拟滚动列表+懒加载" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const loadMoreThreshold = 0.8;
export let loader: LoaderFunction = async ({ request }) => {
  return json(respWithPagination(0, 20), {
    status: 200,
  });
};

const itemHeight = 200;

export default function VirtualScrollList() {
  const data: Resp = useLoaderData();
  const viewportHeight = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true); // 是否展示最后的Loading
  const [listHeight, setListHeight] = useState(100); // 列表容器高度
  const [listData, setListData] = useState<Resp["items"]>([]); // 数据源
  const [renderListData, setRenderListData] = useState<Resp["items"]>([]); // 渲染数据源
  const [page, setPage] = useState(0); // 与请求相关
  // 虚拟列表游标
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  // 虚拟列表偏移
  const [startOffset, setStartOffset] = useState(0);

  const loadMore = async () => {
    const nextPage = page + 1
    const response = await fetch(`/pagination?page=${nextPage}&pageSize=20`);
    if (response.ok) {
      setPage(nextPage)
      setIsLoading(false)
      const respData: Resp = await response.json();
      setListData(listData.concat(respData.items))
    } else {
      console.warn(`请求${nextPage}页数据失败`)
    }
  };

  useEffect(() => {
    if (!listData || end <= 0) return;
    setRenderListData(listData.slice(start, end));
  }, [start, end, listData]);

  const scroll = () => {
    if (!containerRef?.current || isLoading) {
      return;
    }
    const scrollTop = containerRef.current.scrollTop || 0;
    const _start = Math.floor(scrollTop / itemHeight);
    const _end = _start + Math.ceil(viewportHeight.current / itemHeight) + 1; // +1 是为了留下缓冲区buffer, 否则滚动到底部会有一小段空白

    // 检查是否接近底部，并且是否需要加载更多项
    // 这里意味着滚动到准备列表的80%则开始加载更多内容
    if (end >= listData.length * loadMoreThreshold) {
      setIsLoading(true);
      loadMore();
    }

    if (_start !== start) {
      setStart(_start);
    }
    if (_end !== end) {
      setEnd(_end);
    }

    // 这句很精妙: viewportHeight为978(mac里剪去浏览器和书签栏高度)
    // startOffset: 0, scrollTop: 257
    // startOffset: 200, scrollTop: 318
    // startOffset: 400, scrollTop: 492
    // 可以看出startOffset = N*itemSize, 也就是scrollTop最接近的N个itemSize的高度
    // 背后含义: 偏移量的目的是将因为滚动条滚动后将渲染内容偏移会可视区域内, 除此以外，不需要进行偏移，需要偏移的时间点，就是前一条记录刚好离开可视区域
    const _startOffset = scrollTop - (scrollTop % itemHeight);
    console.log(`startOffset: ${startOffset}, scrollTop: ${scrollTop}`);
    setStartOffset(_startOffset);
  };

  useEffect(() => {
    viewportHeight.current = window.innerHeight;
    if (!containerRef.current) return;
    // 获取当前的DOM元素
    const scrollElement = containerRef.current;
    // 为这个元素添加滚动事件监听器
    scrollElement.addEventListener("scroll", scroll);

    // load first screen data
    setListData(data.items);
    setListHeight(data.allItemsNum * itemHeight);
    setIsLoading(false);
    const _start = 0;
    setStart(_start);
    setEnd(_start + Math.ceil(viewportHeight.current / itemHeight));

    // 清理函数：组件卸载时移除事件监听器
    return () => {
      scrollElement.removeEventListener("scroll", scroll);
    };
  }, []); // 空数组表示effect只会在组件挂载时运行一次

  return (
    <div
      className="infinite-list-container"
      ref={containerRef}
      style={{
        height: `${viewportHeight.current}px`,
      }}
      onScroll={scroll}
    >
      <div
        className="infinite-list-phantom"
        style={{
          height: `${listHeight}px`,
        }}
      ></div>
      <div
        className="infinite-list"
        style={{
          transform: `translate3d(0px, ${startOffset}px, 0px)`,
        }}
      >
        {renderListData.map((item, index) => (
          <div
            key={index}
            className="infinite-list-item"
            style={{ height: `${itemHeight}px` }}
          >
            <img src={item.imgUrl} alt="mock picture" height={"100%"} />
            <div className="infinite-list-item-main">
              <h2>{item.title}</h2>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {isLoading ? <Loading /> : null}
    </div>
  );
}
