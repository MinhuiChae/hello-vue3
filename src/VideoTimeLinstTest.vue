<template>
  <div class="boxes">
    <div class="top"> 
      top
    </div>
    <div class="middle">
      <div class="middle-left">
      middle-left
    </div>
    <div class="middle-center">
      middle-center
    </div>
    </div>
    <div class="bottom">
      bottom
    </div>
  </div>
</template>

<script lang="ts">
export default {

}
</script>

<style>
  html, body {
    margin:0px;
    padding:0px;
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
    flex: 0 1 100px;
    
  }

  .middle-center {
    border: 1px solid skyblue;
    flex: 1 1 auto; 
  }

  .bottom {
    border: 1px solid gray;
    margin-top: auto;
    height: 80px;
  }

  .middle {
    display: flex;
    flex-direction: row;
    height: 100vh;
  }
</style>