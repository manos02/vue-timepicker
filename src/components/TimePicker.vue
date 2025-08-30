<template>
    <button class="custom-button">
      {{ props.text }}
    </button>
  </template>
  
  <script setup lang="ts">
  const props = defineProps<{
    text: string;
  }>();
  </script>
  
  <style scoped>
  .custom-button {
    background-color: black;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
  }
  </style>