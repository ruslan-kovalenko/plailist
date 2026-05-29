<template>
  <main>
    <StreamingSelector v-if="!isInitialized" :streamingServiceCallback="setStreamingServiceCallback" />
    <InputRequest v-else :callback="aiRequestCallback" />
  </main>
</template>

<script setup lang="ts">
import InputRequest from './components/InputRequest.vue'
import StreamingSelector from './components/StreamingSelector.vue'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PlaylistFacade from './services/PlaylistFacade'
import { ServiceType } from '@/types/ServiceType'

const isInitialized = ref<boolean>(false)
const route = useRoute()

watch(
  () => route.path,
  async (path) => {
    if (path !== '/callback') return

    isInitialized.value = await PlaylistFacade.useService(ServiceType.Spotify)
  },
  { immediate: false }
)

const aiRequestCallback = async (input: string): Promise<boolean> => {
  return PlaylistFacade.createPlaylist(input)
}

const setStreamingServiceCallback = async (service: ServiceType): Promise<void> => {
  isInitialized.value = await PlaylistFacade.useService(service)
}
</script>

<style scoped>
main {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  object-fit: cover;
  background: url('./assets/img/background-m.jpg') no-repeat center center / cover;
  opacity: 0.65;
}

@media (min-width: 768px) and (max-width: 1200px) {
  main {
    background: url('./assets/img/background-l.jpg') no-repeat center center / cover;
  }
}

@media (min-width: 1201px) {
  main {
    background: url('./assets/img/background-xl.jpg') no-repeat center center / cover;
  }
}
</style>
