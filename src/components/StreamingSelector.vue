<template>
  <div class="container">
    <h6>Choose your streaming service to log in</h6>
    <div class="service-block" @click="spotifyLogin()">
      <img src="@/assets/img/spotify.jpg" alt="spotify" />
      <span> Spotify </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Spotify from '@/services/Spotify'
import { ServiceType } from '@/types/ServiceType'
import SpotifyAuth from '@/services/SpotifyAuth'
import Facade from '@/services/Facade'

const spotifyLogin = async () => {
  await SpotifyAuth.loginWithSpotifyClick()
  Facade.musicService = Spotify
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  top: 50%;
  left: 50%;
  opacity: 0.9;
  background: #fff;
  width: 45vw;
  border-radius: 5px;
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
}
</style>
@/services/Facade@/services/SpotifyAuth@/services/Spotify@/types/ServiceType
