<template>
  <div class="boxes">
    <div class="top"> 
    </div>
    <div class="middle">
      <div class="middle-left">
        <ul>
          <li v-for="video in videoList" :key="video.name" @click="onChangeVideoInfo(video)" class="videoList">
            <div class="listDiv">{{ video.name }}</div>
          </li>
        </ul>
      </div>
      <div class="middle-center">
        <div>{{ state.videoName }}</div>
        <div class="videoWrapDiv">
          <video class="video" :src="state.videoName + '.mp4'" ref="videoEl" v-if="state.videoStatus"></video>
          <div class="videoInfo" v-if="state.videoStatus">
            <span>Current frame: {{ state.currentFrame }}</span>
            <div @click="onChangeVideoPlayStatus()" class="plyBtn">{{ state.buttonName }}</div>
            <span>Total frame: {{ state.videoTotalFrame }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="timelineDiv">
        <input type="range" class="timeline" ref="timelineEl" min="0" max="100" value="100" @mousedown="onChangeTotalFrame()">
      </div>
      <div class="canvasDiv">
        <div class="frameTimeline" ref="lineEl" v-bind:style="{left:(state.singleFramePixel) + 'px'}"></div>
        <canvas class="canvas" :width="state.canvasWidth" height="60" ref = "canvasEl" @mousedown="onMouseDown">이 브라우저는 캔버스를 지원하지 않습니다.</canvas>
      </div>
    </div>
  </div>

  
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue';
import {IVideoInfo} from './interface/index';
import DrawCanvas from './drawCanvas'
const canvasEl = ref<HTMLCanvasElement>();
const timelineEl = ref<HTMLInputElement>();
const videoEl = ref<HTMLVideoElement>();
const lineEl = ref<HTMLDivElement>();
const canvasClass = ref<DrawCanvas>();
export default defineComponent({
  name: 'test-view',
  setup() {  
    const videoList: IVideoInfo[] = [
      {
       name: 'gdragon',
       totalFrame: 5408,
       frameRate: 23.976,
       seenFrameRate: 23.976 
      },
      {
       name: 'BTS' ,
       totalFrame: 5478,
       frameRate: 30,
       seenFrameRate: 29.97291603972314 
      },
      {
       name: 'aespa' ,
       totalFrame: 6439,
       frameRate: 23.976,
       seenFrameRate: 23.97164651966241
      },
      {
       name: 'ITZY' ,
       totalFrame: 6559,
       frameRate: 29.970,
       seenFrameRate: 29.95141286280527
      },
      {
       name: 'Garam' ,
       totalFrame: 4970,
       frameRate: 23.976,
       seenFrameRate: 23.96855634057534
      },
    ] 
    
    const state = reactive({
      canvasCtx: null as unknown as CanvasRenderingContext2D,
      videoName: '',
      videoStatus: false,
      videoTotalFrame: 6000,
      isPlayVideo: false,
      buttonName: 'play',
      currentFrame: 0,
      initWidth: 0,
      canvasWidth: 1200,
      canvasWidthRate: 0,
      singleFramePixel: 0,
      currentFrameRate: 1,
      seenFrameRate: 0,
      currentTotalFrame: 6000,
      intervalNum: 0,
      currentTime: 0,
      isClickedTimeline: false
    })
    
    const onChangeVideoInfo = (video: IVideoInfo) => { 
      initVideoTimelineInfo();
      state.isPlayVideo = false;
      state.buttonName = 'play';
      state.videoStatus = true;
      state.videoName = video.name;
      state.seenFrameRate = video.seenFrameRate;
      state.videoTotalFrame = video.totalFrame;
      state.currentTotalFrame = video.totalFrame;
      canvasClass.value?.setVideoFrameRate(video.frameRate);
      drawCanvas(0, video.totalFrame);
    }
    

    const onMouseDown = (e: MouseEvent) => {
      // Bar를 옮긴다.
      // window MouseMove 이벤트를 만든다.
      // window mouseup 이벤트를 만든다.
      changeTimelinePosition(e);
      window.addEventListener('mousemove', changeTimelinePosition);    
      window.addEventListener('mouseup', upEvent);    
    }

    const upEvent = () => {
      console.log('up event')
      window.removeEventListener('mousemove', changeTimelinePosition);
      window.removeEventListener('mouseup', upEvent);
    }

    const changeTimelinePosition = (event: MouseEvent) => {
      const rect = canvasEl.value?.getBoundingClientRect();
      if(rect && canvasEl.value && canvasClass.value) {
        const linePosition = event.clientX - rect.left;
        state.singleFramePixel = linePosition;
        const pixel = canvasEl.value.width / state.currentTotalFrame;
        state.currentTime = (linePosition / pixel) / canvasClass.value.videoFrameRate;
        if(videoEl.value) 
        videoEl.value.currentTime = state.currentTime;
      }
    }
    
    const initVideoTimelineInfo = () => {
      if(timelineEl.value) {
        timelineEl.value.value = '100';
        state.currentFrameRate = 1;
      }
    }

    const drawCanvas = (start: number, end: number) => {
      state.currentTime = 0;
      state.singleFramePixel = 0;
      const canvas = canvasClass.value;
      if (canvas && canvasEl.value) {
        canvasEl.value.width = window.innerWidth;
        canvas.setRuleUnit(15);
        canvas.draw(start, end);
      }
    }

    const onChangeVideoPlayStatus = () => {
      changeButtonName();
      if(state.isPlayVideo) {
        videoEl.value?.pause();
      } else {
        videoEl.value?.play();
        decideCurrentVideoInfo();
      }
      state.isPlayVideo = !state.isPlayVideo;
    }

    const decideCurrentVideoInfo = () => {
      const video = videoEl.value;
      if(video) {
        state.intervalNum = setInterval(function() {
          state.currentFrame = Math.floor(video.currentTime * state.seenFrameRate);
          if(canvasEl.value) state.singleFramePixel = canvasEl.value.width / state.currentTotalFrame * state.currentFrame;
        })
      }
    }

    const changeButtonName = () => {
      state.isPlayVideo === false ? (state.buttonName = 'stop') : (state.buttonName = 'play')
    }

    window.onresize = () => {
      if(canvasEl.value) drawCanvas(0, state.currentTotalFrame)
    }

    const handleInput = (e: any) => {
      state.currentFrameRate = Number(`${e.target.value}`) / 100;
      if(canvasEl.value) {
        const seenFrame = state.videoTotalFrame - (canvasEl.value.width / 10);
        state.currentTotalFrame = seenFrame * state.currentFrameRate + (canvasEl.value.width / 10);
      }

      drawCanvas(0, state.currentTotalFrame);
    }

    const onChangeTotalFrame = () => { 
      const range = timelineEl.value;
      if(range) range.oninput = handleInput; 
    }

    

    onMounted(() => {
      state.canvasCtx = canvasEl.value?.getContext('2d') as CanvasRenderingContext2D;
      if(canvasEl.value) canvasClass.value = new DrawCanvas( canvasEl.value, state.canvasCtx);
      drawCanvas(0, state.videoTotalFrame);
    })

    return {
      onChangeVideoInfo,
      onChangeVideoPlayStatus,
      onChangeTotalFrame,
      onMouseDown,
      changeTimelinePosition,
      videoList,
      state,
      videoEl,
      canvasEl,
      timelineEl,
      lineEl,
    }
  }
});
</script>

<style>
  *{
    box-sizing: border-box;
  }
  html, body {
    margin:0px;
    padding:0px;
    width: 100%;
    background-color: #3E3E3E;
    color: white;
  }
  #app {
    width:100%;
    height:100vh;
    overflow: hidden;
  }
  .boxes {
    display: flex;
    flex-direction: column;
    height: 100vh;
    border: 1px solid gray;
  }
  .top {
    border: 1px solid gray;
    height: 30px;
    flex: none;
  }
  .middle-left {
    border: 1px solid gray;
    flex: 0 1 300px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    min-height: 500px;
  }
  .middle-center {
    border: 1px solid gray;
    flex: 1 1 auto; 
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    min-height: 500px;
  }
  .bottom {
    border: 1px solid gray;
    margin-top: auto;
    height: 200px;
    display: flex;
    flex-direction: column;
  }
  .middle {
    display: flex;
    flex-direction: row;
    height: 100vh;
  }
  ul {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0
  }
  li{
    height:40px;
    display: flex;
    margin-bottom: 10px;
    justify-content: center;
    align-items: center;
    background: #000000;
    border-radius: 0.8em;
  }
  .video {
    width: 100%;
    margin-top: 10px;
    border-radius: 0.8em;
    border: 1px solid white;
  }
  .videoInfo {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
  }
  .videoList {
    cursor: pointer;
    border: 1px solid white;
    padding: 40px;
  }
  
  .videoInfo span {
    width: 150px;
  }
  .timelineDiv {
    height: 50px;
  }
  .canvasDiv {
    height: 150px;
    display: flex;
    align-items: center;
    position: relative;
  }
  .timeline {
    width: 300px;
  }
  .frameTimeline{
    border-left: 3px solid lightgray;
    display: inline;
    height: 80px;
    position: absolute;
  }
  .plyBtn {
    cursor: pointer;
    font-size: 20px;
  }
  input{
    accent-color: lightgray;
  }
  .videoWrapDiv {
    width: 700px;
  }
</style>