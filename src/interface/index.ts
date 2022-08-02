import { VNodeRef } from "vue";

interface IVideoInfo {
  name: string,
  totalFrame: number,
  frameRate: number,
  seenFrameRate: number
}

interface IDivInfo {
  divName: string,
  className?: string,
  left?: number,
  top?: number
  originLeft?: number,
  originTop?: number
}

interface IelsInfo {
  name: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number
}


export {IVideoInfo, IDivInfo, IelsInfo};