<template>
<div class="divWrapper">
  <div v-for="(div, i) in divList" :key="div.divName" >
    <div :class="div.className" @mousedown.stop="onMouseDown($event, els[i] )" ref = "els">
      {{ div.divName }}
    </div>
  </div>
</div>
  
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import {IDivInfo} from './interface/index';
const els = ref<HTMLDivElement[]>([]);
export default defineComponent({
  name: 'test-view',
  setup() { 
    const state = reactive({
      div: [] as unknown as HTMLDivElement[],
      moveDiv: [] as unknown as HTMLDivElement[],
      divLeft: 0,
      divTop: 0,
      originDivLeft: 0,
      originDivTop: 0,
      isSeenDiv: false,
      copidDiv: null as unknown as Node,
      selectedDiv: [] as IDivInfo[]
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

    /**
     * 이동하려는 div 의 clientX 가 나머지 div 의 width 사이에 없어야 함.
     */

    const checkDiv = (valueList: string[]) => {
      console.log(valueList)
      divList.map((a) => {
        valueList.map((value) => {
          if(a.divName !== value) {
          els.value.map((b) => {
            if(b.innerHTML === a.divName) {
              state.moveDiv.push(b)
            }
          })
        }
        })
      })
      console.log(state.moveDiv)
      
    }

    const isOverlapDiv = (compareDiv: DOMRect, originDiv: DOMRect) => {
      if((compareDiv.left+compareDiv.width > originDiv.left) && (compareDiv.left < originDiv.left + originDiv.width) &&
      (compareDiv.top + compareDiv.height > originDiv.top) && (compareDiv.top < originDiv.top + originDiv.height)) {
        return true;
      } return false;
    }

    const copyDiv = (div: HTMLDivElement) => {
      state.copidDiv = div.cloneNode(true);
      document.body.appendChild(state.copidDiv); 
    }

    const onMouseDown = (e:MouseEvent, div: HTMLDivElement) => {
      let divNameList: string[] = [];
      state.div.push(div);
      state.div.map((div) => {
        divNameList.push(div.innerHTML)
        const originDivRect = div?.getBoundingClientRect();
        copyDiv(div)
        state.originDivLeft = originDivRect?.left;
        state.originDivTop = originDivRect?.top;

       if(originDivRect) {
        
        state.divLeft = e.clientX - originDivRect?.left;
        state.divTop = e.clientY - originDivRect?.top;
      }


        const selectedDiv:IDivInfo = {
        divName: div.innerHTML,
        left: e.clientX - originDivRect?.left,
        top: e.clientY - originDivRect?.top
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
      e.preventDefault();
      state.selectedDiv.length = 0;
      state.copidDiv.parentElement?.removeChild(state.copidDiv);
      state.div.map((originDiv) => {
        changeDivStyle(originDiv, 'transparent', 'black', String(3), String(1));
        state.moveDiv.map((div) => {
        if(isOverlapDiv(originDiv.getBoundingClientRect() ,div.getBoundingClientRect()) === true) {
          originDiv.style.left = String(state.originDivLeft) + 'px';
          originDiv.style.top = String(state.originDivTop) + 'px';
        }
      })
        if(!e.ctrlKey) {
          state.div.length = 0;
        } 
      })

      window.removeEventListener('mousemove', moveEvent);
      window.removeEventListener('mouseup', upEvent);
      
      state.moveDiv.length = 0;
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
      let booleanList:any[] = [];
      state.div.map((originDiv) => {

          // console.log("originDiv", originDiv)
       
        state.moveDiv.map((div) => {
          // console.log("div", div)
        booleanList.push(isOverlapDiv(originDiv.getBoundingClientRect() ,div.getBoundingClientRect()));
      })

      if(booleanList.includes(true)) {
        changeDivStyle(originDiv, 'red', 'white', String(1), String(0.5));
      } else {
        changeDivStyle(originDiv, originDiv.innerHTML, 'white', String(2), String(0.5));
      }
      })
      
    }

    onMounted(() => {
    })

    return {
      onMouseDown,
      divList,
      state,
      els
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
</style>