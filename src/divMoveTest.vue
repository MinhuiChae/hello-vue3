<template>
   <div class = 'stage-wrapper' ref = 'stageEl' @mousedown="onMouseDownDrag">
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
      copidDiv: [] as unknown as Node[],
      selectedDiv: [] as IDivInfo[],
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isDrag: false,
      isClicked: false,
      isDragAndMove: false,
      elsList: [] as IelsInfo[],
    })

    const divList: IDivInfo[] = [ //만들때만쓴다.
      {
        divName: 'Orange',
        className: 'firstDiv',
        isSelected: false,
      },
      {
        divName: 'Blue',
        className: 'secondDiv',
        isSelected: false,
      },
      {
        divName: 'green',
        className: 'thirdDiv',
        isSelected: false,
      }
      ,
      {
        divName: 'purple',
        className: 'fourthDiv',
        isSelected: false,
      },
      {
        divName: 'pink',
        className: 'fifthDiv',
        isSelected: false,
      }
    ]

    /**
     * 선택된 div 를 제외한 나머지 div를 divList 에서 색출해냄
     * valueList 에 선택된 div 값의 innerHTML 값을 넣어주고
     * divList 에서 넘어온 innerHTML 값이 아닐 경우만 state.compareDiv 에 push 해준다.
     */
    const findOutCompareDiv = () => {
      divList.map((div) => {
        if(div.isSelected === false && div.div) {
          state.comparedDiv.push(div.div)
        }
      })
    }

    /**
     * 비교하려는 Div 와 기존의 Div의 영역이 겹치는지 확인해준다.
     */
    const isOverlapDiv = (compareDiv: DOMRect, originDiv: DOMRect): boolean => {
      if((compareDiv.left + compareDiv.width > originDiv.left) && 
        (compareDiv.left < originDiv.left + originDiv.width) &&
        (compareDiv.top + compareDiv.height > originDiv.top) && 
        (compareDiv.top < originDiv.top + originDiv.height)) {
        return true;
      } return false;
    }
    
    /**
     * 복사해준 div 값을 body에 추가한다.
     */
    const addCopiedDiv = () => {
      divList.map((div) => {
        if(div.isSelected && div.div) {
          changeDivStyle(div.div, div.divName, 'white', String(1), String(0.5));
          state.copidDiv.push(div.div.cloneNode(true))
        }
      })
      
      state.copidDiv.map((copiedDiv) => document.body.appendChild(copiedDiv));
    }

    const removeCopiedDiv = () => {
      state.copidDiv.map((copiedDiv) => copiedDiv.parentElement?.removeChild(copiedDiv))
    }

    /**
     * 선택된 div 들의 위치를 저장
     */
    const saveSelectedDivInfo = (e:MouseEvent) => {
      divList.map((div) => {
        if(div.isSelected && div.div) {
          const originDivRect = div.div.getBoundingClientRect();
          div.left = e.clientX - originDivRect?.left;
          div.top = e.clientY - originDivRect?.top;
          div.originLeft = originDivRect?.left;
          div.originTop = originDivRect?.top;
        }
      })

    }
    
    const onMouseDown = (e:MouseEvent, div: HTMLDivElement) => {
      divList.map((divs) => {
        if(divs.divName === div.innerHTML) {
          divs.isSelected = true;
        } else {
          if(!e.ctrlKey) {
            divs.isSelected = false;
          }
          if(divs.div)
          changeDivStyle(divs.div, 'transparent', 'black', String(3), String(1));
        }
      })
      state.isClicked = true;
       if(state.isDragAndMove === false) {
        if(!e.ctrlKey) state.div.length = 0;
        state.div.push(div);
       }


      addCopiedDiv();
      saveSelectedDivInfo(e);

      window.addEventListener('mousemove', moveEvent);
      window.addEventListener('mouseup', upEvent);
      div.addEventListener('mouseout', mouseOutEvent)
      findOutCompareDiv();
    }

    const mouseOutEvent = () => {
      window.addEventListener('mousedown', clicked)
    }

    const clicked = () => {
      divList.map((div) => {
        div.isSelected = false;
        if(div.div)
        changeDivStyle(div.div, 'transparent', 'black', String(3), String(1));
      })
    }

    const changeDivStyle = (div: HTMLDivElement, background: string, color: string, zIndex: string, opacity: string) => {
      div.style.background = background;
      div.style.color = color;
      div.style.zIndex = zIndex;
      div.style.opacity = opacity;
    }

    const initDivInform = (e: MouseEvent) => {
      if(!e.ctrlKey) state.div.length = 0;
      state.selectedDiv.length = 0;
      state.copidDiv.length = 0;
      state.comparedDiv.length = 0;
    }

    const overlap = () => {
      let isTouchedDiv = false;
      state.div.map((originDiv) => {
        state.comparedDiv.map((div) => {
          if(isOverlapDiv(originDiv.getBoundingClientRect() ,div.getBoundingClientRect())) isTouchedDiv = true;
        })
      })

      //이거 바꿔주기 => div 충돌할 때 originPosition 으로 가는거
      if(isTouchedDiv) {
        divList.map((div) => {
          if(div.isSelected && div.div) {
            div.div.style.left = String(div.originLeft) + 'px';
            div.div.style.top = String(div.originTop) + 'px';
            changeDivStyle(div.div, div.div.innerHTML, 'white', String(2), String(0.5));
          }
        })
      }
    }

    /**
     * mouseUp 을 했을 때
     */
    const upEvent = (e:MouseEvent) => {
      state.isDragAndMove = false;
      e.preventDefault();
      removeCopiedDiv();

      overlap();

      window.removeEventListener('mousemove', moveEvent);
      window.removeEventListener('mouseup', upEvent);

      initDivInform(e);
      saveElsInfo();
    }

    const saveElsInfo = () => {
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
        divList.map((div) => {
          changeDivInfo();
          if(div.isSelected && div.div && div.left && div.top) {
            div.div.style.left = String(event.pageX - div.left) + 'px';
            div.div.style.top = String(event.pageY - div.top) + 'px';
          }
        })
    }

    /**
     * div 끼리 겹치는지를 파악하는 isoverlapDiv 를 이용할 수 있는 함수
     * 비교해야 할 div 가 여러개가 있을 때 적어도 하나의 div 와 겹쳤는지를 반환함.
     */
    const isOverlapDivAtLeastOnce = (overlapBoolean:boolean, booleanList: boolean[]) => {
      booleanList.push(overlapBoolean);
      return booleanList.includes(true);
    }


    const changeDivInfo = () => {
      
      let map = new Map<HTMLDivElement, boolean | boolean[]>();
      const booleanList:boolean[] = [];

      state.div.map((originDiv) => {
        booleanList.length = 0;
        state.comparedDiv.map((div) => {
          const overlapBoolean: boolean = isOverlapDiv(originDiv.getBoundingClientRect() ,div.getBoundingClientRect())
          map.set(originDiv, isOverlapDivAtLeastOnce(overlapBoolean, booleanList));
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
      state.isClicked = false;
      state.elsList.length = 0;
      // upEvent(event)
      overlap();
      state.div.length = 0;
      state.startX = event.pageX;
      state.startY = event.pageY;
      state.isDrag = true;

      if (selectEl.value) {
        selectEl.value.style.left = `${event.pageX}px`;
        selectEl.value.style.top = `${event.pageY}px`;
      }
      window.addEventListener('mousemove', mMove);
      window.addEventListener('mouseup', mouseUpDrag);
    }

    const mouseUpDrag = (event: MouseEvent) => {
      if (selectEl.value) changeDivStyleInfo(selectEl.value, '0', '0');
      
      state.endX = event.pageX;
      state.endY = event.pageY;
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

      if(state.isClicked === false) {
        state.elsList.map((el) => {
          if((state.endX > el.startX) && (state.startX < el.endX) &&
          (state.endY > el.startY) && (state.startY < el.endY)) {
            els.value.map((els) => {
              if(els.innerHTML === el.name) state.div.push(els)
            })
          }
        })

        if(state.div.length > 0) {
          state.isDragAndMove = true;
        }
      }

      moveEvent(event);
    }

    
    const mMove = (event: MouseEvent) => {
      if(!state.isDrag) return;
      const nowX = event.pageX;
      const nowY = event.pageY;

      makeSelectbox(nowX, nowY, event)
    }

    const makeSelectbox = (currentX: number, currentY: number, event: MouseEvent) => {
      if(selectEl.value) {
        changeDivStyleInfo(selectEl.value, `${Math.abs(currentX- state.startX)}px`, `${Math.abs(currentY- state.startY)}px`)

        if(currentX- state.startX < 0 ) {
          selectEl.value.style.left = String(event.pageX) + 'px';
        } if(currentY- state.startY < 0) {
          selectEl.value.style.top = String(event.pageY) + 'px';
        } 
      }
    }

    const changeDivStyleInfo = (div: HTMLDivElement,  width: string, height: string) => {
      div.style.width = width;
      div.style.height = height;
    }

    onMounted(() => {
      saveElsInfo();
      divList.map((div) => {
        els.value.map((el) => {
        if(div.divName === el.innerHTML) {
          div.div = el;
        }
        })
      })

    })

    return {
      onMouseDown,
      onMouseDownDrag,
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

.fourthDiv {
  left: 400px;
  width: 150px;
  border: 1px solid purple;
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
.fifthDiv {
  left: 600px;
  width: 100px;
  border: 1px solid pink;
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
  background-color: #003FD3;
  opacity: 0.3;
  position: relative;
}
</style>