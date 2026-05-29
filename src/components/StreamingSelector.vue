<template>
  <div class="container">
    <h6>Choose your streaming service</h6>
    <div class="service-block" @click="login(ServiceType.Spotify)">
      <img src="@/assets/img/spotify.jpg" alt="spotify" />
      <span> Spotify </span>
    </div>
    <div class="service-block" @click="login(ServiceType.Youtube)">
      <img src="@/assets/img/youtube.png" alt="youtube" />
      <span> Youtube Music </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import { getAuthService } from '@/services/authRegistry'
import { ServiceType } from '@/types/ServiceType'
import type { SetServiceCallback } from '@/types/AiRequestCallback'

const props = defineProps({
  streamingServiceCallback: {
    type: Function as PropType<SetServiceCallback>,
    required: true
  }
})

const login = async (serviceType: ServiceType): Promise<void> => {
  const service = getAuthService(serviceType)
  const isLoggedIn = await service.initClient()

  if (!isLoggedIn) return

  await props.streamingServiceCallback(serviceType)
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  top: 50%;
  left: 50%;
  opacity: 0.9;
  background: #fff;
  color: #000;
  width: 45vw;
  border-radius: 12px;
  transform: translate(-50%, -50%);
  padding: 1rem 2rem 2rem;
}

.service-block {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  text-transform: uppercase;

  img {
    height: 3rem;
  }

  span {
    padding-left: 13px;
    font-size: 1.7rem;

    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }
}

@media (max-width: 1200px) {
  .container {
    width: 96vw;

    h6 {
      font-size: 1.5rem;
    }
  }
}

h6 {
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 3rem;
  font-size: 1.9rem;
  font-weight: 600;
}
</style>
