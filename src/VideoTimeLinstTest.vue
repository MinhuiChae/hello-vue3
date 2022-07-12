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
        <div class="frameTimeline" v-bind:style="{left:(0.22041420118343194 * 1440) + 'px'}"></div>
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

    /**
     *  init 기준:
     *  width pixel에 6000개의 frame 이 있음
     *  100% => 6000frame => width에 라인이 있어야 함.
     *  6000 / width => 
     */

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
      currentCanvasWidth: 0,
      singleFramePixel: 0
    })
    
    const onChangeVideoInfo = (videoName: string, totalFrame: number, frameRate: number) => {  
      state.videoStatus = true;
      state.videoName = videoName;
      state.videoTotalFrame = totalFrame;
      canvasClass.value?.setVideoFrameRate(frameRate)
      drawCanvas(0, totalFrame)
    }

    const drawCanvas = (start: number, end: number) => {
      const video = videoEl.value;
      const canvas = canvasClass.value;
      if(canvasEl.value && video && canvas) {

        video?.addEventListener('timeupdate', function() {
          setInterval(function() {
            state.currentFrame = Math.ceil(video?.currentTime * canvas.videoFrameRate);
          })
        });

        state.singleFramePixel = (canvasEl.value.width / state.videoTotalFrame) * state.currentFrame;
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
      state.currentCanvasWidth = window.innerWidth;
      drawCanvas(0, state.videoFrameRate)
    }

    onMounted(() => {
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
    border-left: 2px solid rgb(27, 17, 17);
    display: inline;
    height: 50px;
    position: absolute;
  }
</style>