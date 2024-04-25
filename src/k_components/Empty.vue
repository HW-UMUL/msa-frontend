<script setup>

</script>

<template>
    <div class="grid-container">
      <div class="grid-item">
        <VIcon class="mr-1" icon="ri-error-warning-line"></VIcon>
        <span>Empty</span>
      </div>
    </div>
  </template>
  
  <style scoped>
  .grid-container {
    display: grid;
    align-items: center; /* 수직 가운데 정렬 */
    height: 100vh; /* 화면 전체 높이를 차지하도록 설정 */
  }
  .grid-item {
    text-align: center;
    margin-top: -20px; /* 위로 조금 올림 */
  }
  </style>
  