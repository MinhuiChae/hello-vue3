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
      div: null as unknown as HTMLDivElement,
      moveDiv: [] as unknown as HTMLDivElement[],
      divLeft: 0,
      divTop: 0,
      originDivLeft: 0,
      originDivTop: 0,
      isSeenDiv: false,
      copidDiv: null as unknown as Node
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

    const checkDiv = (value: string) => {
      divList.map((a) => {
        if(a.divName !== value) {
          els.value.map((b) => {
            if(b.innerHTML === a.divName) {
              state.moveDiv.push(b);
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

    const copyDiv = (div: HTMLDivElement) => {
      state.copidDiv = div.cloneNode(true);
      document.body.appendChild(state.copidDiv); 
    }

    const onMouseDown = (e:MouseEvent, div: HTMLDivElement) => {
      state.div = div as HTMLDivElement; 
      checkDiv(state.div.innerHTML);
      if(e.ctrlKey) {
        console.log(1)
      } else {
        console.log(2)
      }
      const originDivRect = state.div?.getBoundingClientRect();
      copyDiv(state.div)
      state.originDivLeft = originDivRect?.left;
      state.originDivTop = originDivRect?.top;

      if(originDivRect) {
        state.divLeft = e.clientX - originDivRect?.left;
        state.divTop = e.clientY - originDivRect?.top;
      }
      window.addEventListener('mousemove', moveEvent);
      window.addEventListener('mouseup', upEvent);
    }

    const changeDivStyle = (background: string, color: string, zIndex: string, opacity: string) => {
      state.div.style.background = background;
      state.div.style.color = color;
      state.div.style.zIndex = zIndex;
      state.div.style.opacity = opacity;
    }

    const upEvent = () => {
      state.copidDiv.parentElement?.removeChild(state.copidDiv);
      changeDivStyle('transparent', 'black', String(3), String(1));
      state.moveDiv.map((div) => {
        if(isOverlapDiv(state.div?.getBoundingClientRect() ,div.getBoundingClientRect()) === true) {
          state.div.style.left = String(state.originDivLeft) + 'px';
          state.div.style.top = String(state.originDivTop) + 'px';
        }
      })

      window.removeEventListener('mousemove', moveEvent);
      window.removeEventListener('mouseup', upEvent);

      state.moveDiv.length = 0;
    }

    const moveEvent = (event: MouseEvent) => {
      const left = event.pageX - state.divLeft;
      const top = event.pageY - state.divTop;
      changeDivPosition();
      
      state.div.style.left = String(left) + 'px';
      state.div.style.top = String(top) + 'px';
    }

    const changeDivPosition = () => {
      let booleanList:any[] = [];

      state.moveDiv.map((div) => {
        booleanList.push(isOverlapDiv(state.div?.getBoundingClientRect() ,div.getBoundingClientRect()));
      })

      if(booleanList.includes(true)) {
        changeDivStyle('red', 'white', String(1), String(0.5));
      } else {
        changeDivStyle(state.div.innerHTML, 'white', String(2), String(0.5));
      }
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