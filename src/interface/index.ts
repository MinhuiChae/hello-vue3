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
  originTop?: number,
  startX?: number,
  startY?: number,
  endX?: number,
  endY?: number,
  isSelected?: boolean,
  div?: HTMLDivElement
}

interface IelsInfo {
  name: string,
  startX: number,
  startY: number,
  endX: number,
  endY: number
}

interface IDivStyle {
  div: HTMLDivElement, 
  background?: string, 
  color?: string, 
  zIndex?: string, 
  opacity?: string, 
  width?: string, 
  height?: string,
  left?: string,
  top?: string
}


export {IVideoInfo, IDivInfo, IelsInfo, IDivStyle};