import { VNodeRef } from "vue";

interface IVideoInfo {
  name: string,
  totalFrame: number,
  frameRate: number,
  seenFrameRate: number
}

interface IDivInfo {
  divName: string,
  className: string ,
  htmlDivName: HTMLDivElement ,
  refName: VNodeRef | undefined
}

export {IVideoInfo, IDivInfo};