<template>
  <div>
    <div class="firstDiv" @mousedown.stop="onMoveDiv($event, firstDivEl)" ref="firstDivEl">
      Red
    </div>
    <div class="secondDiv" @mousedown.stop="onMoveDiv($event, secondDivEl)" ref="secondDivEl">
      Blue
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
const firstDivEl = ref<HTMLDivElement>();
const secondDivEl = ref<HTMLDivElement>();
export default defineComponent({
  name: 'test-view',
  setup() { 
    const state = reactive({
      div: null as unknown as HTMLDivElement,
      divLeft: 0,
      divTop: 0
    })

    const onMoveDiv = (e:MouseEvent ,div: HTMLDivElement | undefined) => {
      if(div) state.div = div; 
      const divRect = div?.getBoundingClientRect();
      if (divRect) {
        state.divLeft = e.clientX - divRect?.left;
        state.divTop = e.clientY - divRect?.top;
      }

      window.addEventListener('mousemove', changeDivPosition);
      window.addEventListener('mouseup', upEvent);
    }

    const upEvent = () => {
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
      state,
      firstDivEl,
      secondDivEl
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