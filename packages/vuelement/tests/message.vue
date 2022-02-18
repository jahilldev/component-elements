<template>
  <h2 v-if="customTitle">{{ customTitle }}</h2>
  <em>{{ value }}</em>
</template>

<script>
  export default {
    name: 'Message',
    props: ['customTitle', 'value']
  };
</script>

<style>
  em {
    font-size: 24px;
    margin: 0;
  }
</style>
