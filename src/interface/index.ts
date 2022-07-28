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
}


export {IVideoInfo, IDivInfo};