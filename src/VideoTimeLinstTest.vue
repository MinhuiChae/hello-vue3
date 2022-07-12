<template>
  <div class="boxes">
    <div class="top"> 
      top
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
          <button @click="onPlayVideo()">{{ state.buttonName }} button</button>
          <span>Total frame: {{ state.videoTotalFrame }}</span>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="timelineDiv">
        <input type="range" class="timeline">
      </div>
      <div class="canvasDiv">
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
const videoEl = ref<HTMLVideoElement>();
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

    const state = reactive({
      canvasCtx: null as unknown as CanvasRenderingContext2D,
      videoName: '',
      videoStatus: false,
      videoTotalFrame: 0,
      isPlayVideo: false,
      buttonName: 'play',
      videoFrameRate: 6000,
      currentFrame: 0,
      initWidth: 0,
      canvasWidth: 1200,
      canvasWidthRate: 0,
      currentCanvasWidth: 0
    })
    
    const onChangeVideoInfo = (videoName: string, totalFrame: number, frameRate: number) => {  
      state.videoStatus = true;
      state.videoName = videoName;
      state.videoTotalFrame = totalFrame;
      canvasClass.value?.setVideoFrameRate(frameRate)
      drawCanvas(0, totalFrame)
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

    const onPlayVideo = () => {
      changeButtonName();
      if(state.isPlayVideo) {
        videoEl.value?.pause();
      } else {
        videoEl.value?.play();
      }

      state.isPlayVideo = !state.isPlayVideo;
      
    }

    const changeButtonName = () => {
      if(state.isPlayVideo === false) {
        state.buttonName = 'stop'
      } else {
        state.buttonName = 'play'
      }
    }

    window.onresize = () => {
      state.canvasWidth = window.innerWidth;
      state.canvasWidthRate =  state.canvasWidth / state.currentCanvasWidth ;
      console.log(state.canvasWidthRate)
      console.log(state.videoFrameRate * state.canvasWidthRate)
      drawCanvas(0, Math.ceil(state.videoFrameRate * state.canvasWidthRate))
    }

    onMounted(() => {
      state.currentCanvasWidth = window.innerWidth;
      state.canvasCtx = canvasEl.value?.getContext('2d') as CanvasRenderingContext2D;
      if(canvasEl.value) {
        canvasClass.value = new DrawCanvas( canvasEl.value, state.canvasCtx);
      }

      drawCanvas(0, state.videoFrameRate)
    })

    return {
      onChangeVideoInfo,
      onPlayVideo,
      videoList,
      state,
      videoEl,
      canvasEl
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
    width: 100%
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
    border: 1px solid black;
  }

  .top {
    border: 1px solid red;
    height: 30px;
    flex: none;
  }

  .middle-left {
    border: 1px solid orange;
    flex: 0 1 300px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .middle-center {
    border: 1px solid skyblue;
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
    margin-bottom: 50px;
  }

  .video {
    width: 100vh;
    margin-top: 10px;
  }

  .videoInfo {
    width: 100vh;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
  }

  .videoList {
    cursor: pointer;
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
  }

  .timeline {
    width: 300px;
  }

  .canvas {
    width: 100%;
    height: 50px;
  }
</style>