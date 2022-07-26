<template>
  <div v-for="(div, i) in divList" :key="div.divName">
    <div :class="div.className" @mousedown.stop="onMoveDiv($event, els[i] )" ref = "els">
      {{ div.divName }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
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
      originDivTop: 0
    })
    const divList: IDivInfo[] = [
      {
        divName: 'Red',
        className: 'firstDiv'
      },
      {
        divName: 'Blue',
        className: 'secondDiv'
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

    const onMoveDiv = (e:MouseEvent, div: HTMLDivElement) => {
      state.div = div as HTMLDivElement; 
      checkDiv(state.div.innerHTML);
      const originDivRect = state.div?.getBoundingClientRect();

      state.originDivLeft = originDivRect?.left;
      state.originDivTop = originDivRect?.top;

      if(originDivRect) {
        state.divLeft = e.clientX - originDivRect?.left;
        state.divTop = e.clientY - originDivRect?.top;
      }

      window.addEventListener('mousemove', changeDivPosition);
      window.addEventListener('mouseup', upEvent);
    }

    const upEvent = () => {
      state.moveDiv.map((div) => {
        if(isOverlapDiv(state.div?.getBoundingClientRect() ,div.getBoundingClientRect()) === true) {
        state.div.style.left = String(state.originDivLeft) + 'px';
        state.div.style.top = String(state.originDivTop) + 'px';
      }
      })
      

      window.removeEventListener('mousemove', changeDivPosition);
      window.removeEventListener('mouseup', upEvent);
    }

    const changeDivPosition = (event: MouseEvent) => {
      const left = event.pageX - state.divLeft;
      const top = event.pageY - state.divTop;

      state.div.style.left = String(left) + 'px';
      state.div.style.top = String(top) + 'px';
    }

    return {
      onMoveDiv,
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

.wrapper {
  display:flex;
  width:100%;
  height:100vh;
}

.left {
  width:300px;
}
  .firstDiv {
    width: 50px;
    border: 1px solid red;
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
</style>