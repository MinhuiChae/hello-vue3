<template>
  <div class = 'box'>
    <div class ='none-flex1'>1</div><div class ='flex'>2</div><div class ='none-flex2'>3</div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
/**
 * padding, margin 
 */
export default defineComponent({
  name: 'test-test',
  setup() {
    
  },
})
</script>
<style>
*{
  box-sizing: border-box;
}

 body {
  padding:0px;
  margin:0px;
  background: #fff;
  color:white;
 }

 #app {
  width:100%;
  height:100vh;
  overflow: hidden;
  background-color: #2e2e2e;
 }

 .box {
  display:flex;
  align-items: center;
  justify-content: center;
  
  height:100vh;
 
  flex-direction: column;
 }

 .box div {
   display: flex;
    width:100%;
      background: #000;
 }

 .flex {
  min-height: 300px;
  flex:1;
  margin-bottom: 5px;
 }

 .none-flex1 {
  height:50px;
  margin-bottom: 5px;

 }

  .none-flex2 {
    height:240px;  
 }
</style>
