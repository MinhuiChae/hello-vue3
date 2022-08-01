<template>
  <div v-for="(div, i) in divList" :key="div.divName" >
    <div :class="div.className" @mousedown.stop="onMouseDown($event, els[i] )" ref = "els">
      {{ div.divName }}
    </div>
  </div>


<canvas class="canvas" width="1000" height="1000" ref = "canvasEl" 
  @mousedown="onMouseDownDrag"
  @mousemove="mMove"
  @mouseup="onMouseUpDrag"
  @mouseout="onMouseOutDrag"
  >이 브라우저는 캔버스를 지원하지 않습니다.</canvas>
  
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import {IDivInfo} from './interface/index';
const els = ref<HTMLDivElement[]>([]);
const canvasEl = ref<HTMLCanvasElement>();
export default defineComponent({
  name: 'test-view',
  setup() { 
    const state = reactive({
      canvasCtx: null as unknown as CanvasRenderingContext2D,
      div: [] as unknown as HTMLDivElement[],
      comparedDiv: [] as unknown as HTMLDivElement[],
      divLeft: 0,
      divTop: 0,
      originDivLeft: 0,
      originDivTop: 0,
      isSeenDiv: false,
      copidDiv: [] as unknown as Node[],
      selectedDiv: [] as IDivInfo[],
      dragXposition: 0,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      stX: 0,
      stY: 0,
      isDrag: false,
      innerWidth: 1000,
      innerHeight: 0
    })
    const divList: IDivInfo[] = [
      {
        divName: 'Orange',
        className: 'firstDiv',
      },
      {
        divName: 'Blue',
        className: 'secondDiv',
      },
      {
        divName: 'green',
        className: 'thirdDiv',
      }
    ]

    const checkDiv = (valueList: string[]) => {
      divList.map((a) => {
        if(!valueList.includes(a.divName)) {
          els.value.map((b) => {
            if(b.innerHTML === a.divName) {
              state.comparedDiv.push(b)
            }
          })
        }
      })
    }

    const isOverlapDiv = (compareDiv: DOMRect, originDiv: DOMRect) => {
      if((compareDiv.left+compareDiv.width > originDiv.left) && (compareDiv.left < originDiv.left + originDiv.width) &&
      (compareDiv.top + compareDiv.height > originDiv.top) && (compareDiv.top < originDiv.top + originDiv.height)) {
        return true;
      } return false;
    }

    const copyDiv = (div: HTMLDivElement[]) => {
      div.map((selectedDiv) => {
        state.copidDiv.push(selectedDiv.cloneNode(true))
      })

      state.copidDiv.map((copiedDiv) => {
        document.body.appendChild(copiedDiv); 
      })
    }

    const onMouseDown = (e:MouseEvent, div: HTMLDivElement) => {
      if(!e.ctrlKey) {
        state.div.length = 0;
      } 
      let divNameList: string[] = [];
      state.div.push(div);
      copyDiv(state.div)
      state.div.map((div) => {
        divNameList.push(div.innerHTML)
        const originDivRect = div?.getBoundingClientRect();
        state.originDivLeft = originDivRect?.left;
        state.originDivTop = originDivRect?.top;

        if(originDivRect) {
          state.divLeft = e.clientX - originDivRect?.left;
          state.divTop = e.clientY - originDivRect?.top;
        }
        const selectedDiv:IDivInfo = {
          divName: div.innerHTML,
          left: e.clientX - originDivRect?.left,
          top: e.clientY - originDivRect?.top,
          originLeft: originDivRect?.left,
          originTop: originDivRect?.top
        }
        state.selectedDiv.push(selectedDiv)
        
        window.addEventListener('mousemove', moveEvent);
        window.addEventListener('mouseup', upEvent);
      })

      checkDiv(divNameList);
    }

    const changeDivStyle = (div: HTMLDivElement, background: string, color: string, zIndex: string, opacity: string) => {
      div.style.background = background;
      div.style.color = color;
      div.style.zIndex = zIndex;
      div.style.opacity = opacity;
    }

    const upEvent = (e:MouseEvent) => {
      let isTouchedDiv = false;
      e.preventDefault();
      state.copidDiv.map((copiedDiv) => {
        copiedDiv.parentElement?.removeChild(copiedDiv);
      })

      state.div.map((originDiv) => {
        changeDivStyle(originDiv, 'transparent', 'black', String(3), String(1));
        state.comparedDiv.map((div) => {
          if(isOverlapDiv(originDiv.getBoundingClientRect() ,div.getBoundingClientRect()) === true) {
            isTouchedDiv = true;
          }
        })
      })

      if(isTouchedDiv) {
        state.div.map((originDiv) => {
          state.selectedDiv.map((selectedDiv) => {
            if(originDiv.innerHTML === selectedDiv.divName) {
              originDiv.style.left = String(selectedDiv.originLeft) + 'px';
              originDiv.style.top = String(selectedDiv.originTop) + 'px';
            }
          })
        })
      }

      window.removeEventListener('mousemove', moveEvent);
      window.removeEventListener('mouseup', upEvent);

      if(!e.ctrlKey) {
        state.div.length = 0;
      } 
      state.selectedDiv.length = 0;
      state.copidDiv.length = 0;
      state.comparedDiv.length = 0;
    }

    const moveEvent = (event: MouseEvent) => {
      state.div.map((div) => {
        changeDivPosition();
        state.selectedDiv.map((selectedDiv) => {
          if(div.innerHTML === selectedDiv.divName) {
            if(selectedDiv.left && selectedDiv.top) {
              div.style.left = String(event.pageX - selectedDiv.left) + 'px';
              div.style.top = String(event.pageY - selectedDiv.top) + 'px';
            }
          }
        })
      })
    }

    const changeDivPosition = () => {
      let map = new Map<HTMLDivElement, boolean | boolean[]>();
      let booleanList:boolean[] = [];
      let boolean: boolean = false;
      state.div.map((originDiv) => {
        state.comparedDiv.map((div) => {
          booleanList.push(isOverlapDiv(originDiv.getBoundingClientRect() ,div.getBoundingClientRect()));
          if(booleanList.includes(true)) {
            boolean = true;
          } else {
            boolean = false;
          }

          if(state.div.length === 1) {
            map.set(originDiv, boolean);
          } else {
            map.set(originDiv, isOverlapDiv(originDiv.getBoundingClientRect() ,div.getBoundingClientRect()))
          }
        })
      })
      
      map.forEach((value, key) => {
        if(value) {
          changeDivStyle(key, 'red', 'white', String(1), String(0.5));
        } else {
          changeDivStyle(key, key.innerHTML, 'white', String(2), String(0.5));
        }
      })

      if(map.size === 0) {
        state.div.map((a) => {
          changeDivStyle(a, a.innerHTML, 'white', String(2), String(0.5));
        })
      }
    }

    const onMouseDownDrag = (event: MouseEvent) => {
      state.startX = event.offsetX;
      state.startY = event.offsetY;
      state.stX = event.offsetX;
      state.stY = event.offsetY;
      state.isDrag = true;
    }

    const onMouseUpDrag = (event: MouseEvent) => {

      state.endX = event.offsetX;
      state.endY = event.offsetY;
      state.isDrag = false;
      
      const context = state.canvasCtx;
      context.clearRect(0,0,context.canvas.width,context.canvas.height) 

      if(canvasEl.value) {
        canvasEl.value.style.position = 'static'
      }
    }

    const onMouseOutDrag = () => {
      state.isDrag = false;
    }

    const drawCanvas = (currentX: number, currentY: number) => {
      if(canvasEl.value) {
        canvasEl.value.style.position = 'relative'
      }
      const context = state.canvasCtx;
      context.clearRect(0,0,context.canvas.width,context.canvas.height) 
      context.fillRect(state.startX, state.startY, currentX- state.startX,currentY- state.startY) 
    }

    const mMove = (event: MouseEvent) => {
      if(!state.isDrag) {
        return;
      }

      const nowX = event.offsetX;
      const nowY = event.offsetY;
      drawCanvas(nowX, nowY);

      state.stX = nowX;
      state.stY = nowY;
    }

    onMounted(() => {
      state.canvasCtx = canvasEl.value?.getContext('2d') as CanvasRenderingContext2D;
      state.canvasCtx.fillStyle='#6799FF'
      state.canvasCtx.globalAlpha = 0.5
      state.canvasCtx.fill();
    })

    return {
      onMouseDown,
      onMouseDownDrag,
      onMouseUpDrag,
      onMouseOutDrag,
      mMove,
      divList,
      canvasEl,
      state,
      els,
    }
  }
})
</script>

<style>
body {
  margin:0;
  padding:0;
  width:100%;
  height:100vh;
}

.divWrapper {
  display:flex;
  width:100%;
  height:100vh;
  position: absolute;
}

.left {
  width:300px;
}

.firstDiv {
  left: 100px;
  width: 50px;
  border: 1px solid orange;
  display: flex;
  justify-content: center;
  padding: 30px;
  border-radius: 0em;
  position: absolute;
  cursor: pointer;
  -ms-user-select: none; 
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  
}

.secondDiv {
  left: 250px;
  width: 50px;
  border: 1px solid blue;
  display: flex;
  justify-content: center;
  padding: 20px;
  border-radius: 0em;
  position: absolute;
  cursor: pointer;
  -ms-user-select: none; 
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
}
.thirdDiv {
  width: 50px;
  border: 1px solid green;
  display: flex;
  justify-content: center;
  padding: 10px;
  border-radius: 0em;
  position: absolute;
  cursor: pointer;
  -ms-user-select: none; 
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
}

.canvas {
  border: 1px solid blue;
  z-index: 10;
}
</style>