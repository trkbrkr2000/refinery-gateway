<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
    <DynamicForm :form-id="formId" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const formId = computed(() => route.params.id as string)

useHead({
  title: `Form - FormReady`,
  meta: [
    { name: 'description', content: 'Fill out this form easily' }
  ]
})
</script>