<template>
  <div>
    <h1>Test Page</h1>
    <p>This is a simple test page to verify Vue routing works.</p>
    <p>Form ID from route: {{ $route.params.id }}</p>
  </div>
</template>

<script setup>
console.log('Test page loaded!')
</script>