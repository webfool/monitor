/**
 * 上报数据的方法，建议通过 get 一个 gif 图的方式，因为
 * - gif 图能达到 1x1 像素最小图
 * - 支持跨域
 */
export default function tracker(data) {
  console.log('tracker data ->', data)
}