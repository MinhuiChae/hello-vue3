<template>
  <div class="boxes">
    <div class="top"> 
    </div>
    <div class="middle">
      <div class="middle-left">
        <ul>
          <li v-for="video in videoList" :key="video.name" @click="onChangeVideoInfo(video.name, video.totalFrame, video.frameRate)" class="videoList">
            {{ video.name }}
          </li>
        </ul>
      </div>
      <div class="middle-center">
        <video class="video" :src="state.videoName + '.mp4'" ref="videoEl" v-if="state.videoStatus"></video>
        <div class="videoInfo" v-if="state.videoStatus">
          <span>Current frame: {{ state.currentFrame }}</span>
          <div @click="onChangeVideoPlayStatus()" class="plyBtn">{{ state.buttonName }}</div>
          <span>Total frame: {{ state.videoTotalFrame }}</span>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="timelineDiv">
        <input type="range" class="timeline" ref="timelineEl" min="1" max="100" value="100" @mousedown="onChangeTotalFrame()">
      </div>
      <div class="canvasDiv">
        <div class="frameTimeline" ref="lineEl" v-bind:style="{left:(state.singleFramePixel) + 'px'}" @mousedown="onChangelinePosition()"></div>
        <canvas class="canvas" :width="state.canvasWidth" height="40" ref = "canvasEl">이 브라우저는 캔버스를 지원하지 않습니다.</canvas>
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
       frameRate: 23.976
      },
      {
       name: 'BTS' ,
       totalFrame: 5478,
       frameRate: 30
      },
      {
       name: 'aespa' ,
       totalFrame: 6439,
       frameRate: 23.976
      },
      {
       name: 'ITZY' ,
       totalFrame: 6559,
       frameRate: 29.970
      },
      {
       name: 'Garam' ,
       totalFrame: 4970,
       frameRate: 23.976
      },
    ] 

    /**
     *  init 기준:
     *  width pixel에 6000개의 frame 이 있음
     *  100% => 6000frame => width에 라인이 있어야 함.
     *  6000 / width => 
     *  width === 1279pixel
     */

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
      currentCanvasWidth: 0,
      singleFramePixel: 0,
      currentFrameRate: 1,
    })
    
    const onChangeVideoInfo = (videoName: string, totalFrame: number, frameRate: number) => {  
      initVideoTimelineInfo();
      state.isPlayVideo = false;
      state.buttonName = 'play';
      state.videoStatus = true;
      state.videoName = videoName;
      state.videoTotalFrame = totalFrame;
      canvasClass.value?.setVideoFrameRate(frameRate);
      drawCanvas(0, totalFrame)
    }
    
    const initVideoTimelineInfo = () => {
      if(timelineEl.value) {
        timelineEl.value.value = '100';
        state.currentFrameRate = 1;
      }
    }

    const drawCanvas = (start: number, end: number) => {
      const canvas = canvasClass.value;
      if(canvasEl.value) {
        canvasEl.value.width = window.innerWidth;
      }
      if (canvas) {
        canvas.setRuleUnit(15);
        canvas.draw(start, end);
      }
    }

    /**0~100%;
     * 100% => 6439frame
     * 90% => 5795frame
     * 1frame => totalFrame / canvasWidth;
     * 2frame => totalFrame / canvasWidth * 2
     */

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
      const canvas = canvasClass.value
      video?.addEventListener('timeupdate', function() {
        if(canvas)
        setInterval(function() {
          if(canvasEl.value) {
            state.currentFrame = Math.round(video?.currentTime * canvas.videoFrameRate);
            state.singleFramePixel = (canvasEl.value.width/ state.videoTotalFrame) * (state.currentFrame / state.currentFrameRate);
          }
        })
      });
    }

    const changeButtonName = () => {
      state.isPlayVideo === false ? (state.buttonName = 'stop') : (state.buttonName = 'play')
    }

    window.onresize = () => {
      if(canvasEl.value) {
        state.currentCanvasWidth = canvasEl.value.width;
        drawCanvas(0, state.videoTotalFrame * state.currentFrameRate)
      }
    }

    const handleInput = (e: any) => {
      state.currentFrameRate = Number(`${e.target.value}`) / 100;
      drawCanvas(0, state.videoTotalFrame * state.currentFrameRate);
    }

    const onChangeTotalFrame = () => { 
      const range = timelineEl.value;
      if(range) {
        range.oninput = handleInput; 
      }
    }

    const onChangelinePosition = () => {
      const line = lineEl.value;
      line?.addEventListener("mousedown", function(e: any) {
        line.style.width = e.clientX + "px";
      })
    }

    onMounted(() => {
      state.canvasCtx = canvasEl.value?.getContext('2d') as CanvasRenderingContext2D;
      if(canvasEl.value) {
        canvasClass.value = new DrawCanvas( canvasEl.value, state.canvasCtx);
      }

      drawCanvas(0, state.videoTotalFrame);
    })

    return {
      onChangeVideoInfo,
      onChangeVideoPlayStatus,
      onChangeTotalFrame,
      onChangelinePosition,
      videoList,
      state,
      videoEl,
      canvasEl,
      timelineEl,
      lineEl
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
  }

  .middle-center {
    border: 1px solid gray;
    flex: 1 1 auto; 
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
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
    width: 100vh;
    margin-top: 10px;
    border-radius: 0.8em;
    border: 1px solid white;
  }

  .videoInfo {
    width: 100vh;
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

  .canvas {
    width: 100%;
    height: 50px;
  }

  .frameTimeline{
    border-left: 3px solid rgb(183, 203, 255);
    display: inline;
    height: 80px;
    position: absolute;
  }

  .plyBtn {
    cursor: pointer;
    font-size: 20px;
  }
</style>