<template>
   <div class = 'stage-wrapper' ref = 'stageEl' 
  @mousedown="onMouseDownDrag"
  @mousemove="mMove"
  @mouseup="onMouseUpDrag"
  @mouseout="onMouseOutDrag"
  >
    <div v-for="(div, i) in divList" :key="div.divName" >
      <div :class="div.className" @mousedown.stop="onMouseDown($event, els[i] )" ref = "els">
        {{ div.divName }}
      </div>
    </div>
  </div>

  <div class="selectDiv" ref = "selectEl"></div>
  
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import {IDivInfo, IelsInfo} from './interface/index';
const els = ref<HTMLDivElement[]>([]);
const selectEl = ref<HTMLDivElement>();
const stageEl = ref<HTMLDivElement>();
export default defineComponent({
  name: 'test-view',
  setup() { 
    const state = reactive({
      div: [] as unknown as HTMLDivElement[],
      comparedDiv: [] as unknown as HTMLDivElement[],
      divLeft: 0,
      divTop: 0,
      originDivLeft: 0,
      originDivTop: 0,
      isSeenDiv: false,
      copidDiv: [] as unknown as Node[],
      selectedDiv: [] as IDivInfo[],
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      stX: 0,
      stY: 0,
      isDrag: false,
      isDragAndMove: false,
      elsList: [] as IelsInfo[]
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
        changeDivStyle(selectedDiv, selectedDiv.innerHTML, 'white', String(1), String(0.5));
        state.copidDiv.push(selectedDiv.cloneNode(true))
      })

      state.copidDiv.map((copiedDiv) => {
        document.body.appendChild(copiedDiv); 
      })
    }

    const onMouseDown = (e:MouseEvent, div: HTMLDivElement) => {
      let divNameList: string[] = [];
       if(state.isDragAndMove === false) {
        if(!e.ctrlKey) {
          state.div.length = 0;
        } 
        state.div.push(div);
       }

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
      console.log('up')
      state.isDragAndMove = false;
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

      els.value.map((els => {
        const elsInfo = {
          name: els.innerHTML,
          startX: els.offsetLeft,
          startY: els.offsetTop,
          endX: els.offsetLeft + els.offsetWidth,
          endY: els.offsetTop + els.offsetHeight
        }
        
        state.elsList.push(elsInfo)
      }))
    }

    const moveEvent = (event: MouseEvent) => {
      console.log(state.div)
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
          changeDivStyle(key, 'red', 'white', String(1), String(1));
        } else {
          changeDivStyle(key, key.innerHTML, 'white', String(2), String(0.3));
        }
      })

      if(map.size === 0) {
        state.div.map((a) => {
          changeDivStyle(a, a.innerHTML, 'white', String(2), String(0.5));
        })
      }
    }

    const onMouseDownDrag = (event: MouseEvent) => {
      state.elsList.length = 0;
      upEvent(event)
      state.div.length = 0;
      state.startX = event.offsetX;
      state.startY = event.offsetY;
      state.stX = event.offsetX;
      state.stY = event.offsetY;
      state.isDrag = true;

      if (selectEl.value) {
        selectEl.value.style.left = `${event.offsetX}px`;
        selectEl.value.style.top = `${event.offsetY}px`;
      }
    }

    const onMouseUpDrag = (event: MouseEvent) => {

      if (selectEl.value) {
        selectEl.value.style.width = '0';
        selectEl.value.style.height = '0';
      }

      state.endX = event.offsetX;
      state.endY = event.offsetY;
      state.isDrag = false;

      if(state.endX < state.startX) {
        const x = state.startX;
        state.startX = state.endX;
        state.endX = x
      }

      if(state.endY < state.startY) {
        const y = state.startY
        state.startY = state.endY
        state.endY = y
      }

      state.elsList.map((el) => {
        if((state.endX > el.startX) && (state.startX < el.endX) &&
        (state.endY > el.startY) && (state.startY < el.endY)) {
          els.value.map((els) => {
            if(els.innerHTML === el.name) {
              state.div.push(els)
            }
          })
        }
      })

      if(state.div.length > 0) {
        state.isDragAndMove = true;
      }

      moveEvent(event);
    }

    const onMouseOutDrag = () => {
      state.isDrag = false;
    }

    const mMove = (event: MouseEvent) => {
      if(!state.isDrag) {
        return;
      }

      const nowX = event.offsetX;
      const nowY = event.offsetY;
      makeSelectbox(nowX, nowY)
      state.stX = nowX;
      state.stY = nowY;
    }

    const makeSelectbox = (currentX: number, currentY: number) => {
      if(selectEl.value && stageEl.value) {
        selectEl.value.style.width = `${currentX- state.startX}px`;
        selectEl.value.style.height = `${currentY- state.startY}px`;
        selectEl.value.style.position = 'relative';
      }
    }

    onMounted(() => {
      els.value.map((els => {
        const elsInfo = {
          name: els.innerHTML,
          startX: els.offsetLeft,
          startY: els.offsetTop,
          endX: els.offsetLeft + els.offsetWidth,
          endY: els.offsetTop + els.offsetHeight
        }
        
        state.elsList.push(elsInfo)
      }))
    })

    return {
      onMouseDown,
      onMouseDownDrag,
      onMouseUpDrag,
      onMouseOutDrag,
      mMove,
      divList,
      selectEl,
      stageEl,
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
   overflow: hidden;
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

.stage-wrapper {
  width:100%;
  height:100vh;
  position: absolute;
}

.selectDiv {
  pointer-events: none;
  background-color: #FF717182;
  z-index : 10;
  opacity: 0.3;
}
</style>