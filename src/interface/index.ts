import { VNodeRef } from "vue";

interface IVideoInfo {
  name: string,
  totalFrame: number,
  frameRate: number,
  seenFrameRate: number
}

interface IDivInfo {
  divName: string,
  className: string,
}

export {IVideoInfo, IDivInfo};