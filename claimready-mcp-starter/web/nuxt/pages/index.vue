<template>
  <div style="padding:24px">
    <h1>ClaimReady</h1>
    <p>Upload a VA decision letter (text) and parse.</p>
    <form @submit.prevent="submit">
      <textarea v-model="text" rows="10" cols="80" placeholder="Paste VA decision text here"></textarea>
      <br/>
      <button type="submit">Parse</button>
    </form>
    <pre v-if="result">{{ JSON.stringify(result, null, 2) }}</pre>
  </div>
</template>

<script setup lang="ts">
const text = ref('Decision: tinnitus is granted. Lumbosacral strain is denied.')
const result = ref<any>(null)
const submit = async () => {
  const { data } = await $fetch('http://localhost:7100/parse', { method: 'POST', body: { s3Key: null, uploadId: 'demo', text: text.value } as any })
  result.value = data || data
}
</script>
