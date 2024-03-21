<template>
  <main>
    <StreamingSelector v-if="streamingService == null" />
    <InputRequest :callback="aiRequestCallback" v-else />
  </main>
</template>

<script setup lang="ts">
import InputRequest from './components/InputRequest.vue'
import StreamingSelector from './components/StreamingSelector.vue'
import { ServiceType } from '@/types/ServiceType'
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Facade from './services/Facade'
import Spotify from './services/Spotify'
import SpotifyAuth from './services/SpotifyAuth'

const streamingService = ref(null)

const aiRequestCallback = async (input: string): boolean => {
  return Facade.createPlaylist(input)
}

onMounted(async () => {
  streamingService.value = await Facade.initMusicServiceInstance()
})
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
./services/Facade./services/SpotifyAuth./services/Spotify@/types/ServiceType
