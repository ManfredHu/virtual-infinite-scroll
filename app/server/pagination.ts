const allItemsNum = 1000000;

export type Resp = {
  items: {
    title: string;
    desc: string;
    imgUrl: string;
  }[];
  page: number;
  allItemsNum: number;
  code: number;
  msg: string;
};

export function respWithPagination(page = 0, pageSize = 20): Resp {
  const start = page * pageSize;
  const end = start + pageSize;
  console.log('page range: start & end', start, end)
  // 模拟数据源，您可以替换为实际的数据加载逻辑
  const data = Array.from({ length: end - start }, (_, index) => ({
    title: `Item ${index + start + 1}`,
    desc: `Item desc ${index + start + 1}`,
    imgUrl: `https://picsum.photos/300/300`,
  }));

  const items = data
  const rst = { items, page, allItemsNum, code: 0, msg: "" };
  console.log('rst', rst)
  return rst
}
