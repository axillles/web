<template>
  <div class="address-map">
    <div class="search-container">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        placeholder="Введите адрес..."
        class="search-input"
      />
      <div v-if="suggestions.length" class="suggestions">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.value"
          @click="selectAddress(suggestion)"
          class="suggestion-item"
        >
          {{ suggestion.value }}
        </div>
      </div>
    </div>

    <div class="map-container">
      <ymap-map
        :coords="coordinates"
        :zoom="16"
        :controls="['zoomControl']"
        @click="handleMapClick"
        style="width: 100%; height: 400px"
      >
        <ymap-marker
          v-if="coordinates"
          :coords="coordinates"
          marker-type="placemark"
          :options="{ draggable: true }"
          @dragend="handleMarkerDrag"
        />
      </ymap-map>
    </div>

    <div v-if="selectedAddress" class="selected-address">
      <p>Выбранный адрес:</p>
      <p class="address-text">{{ selectedAddress }}</p>
    </div>
  </div>
</template>

<script>
import { useYmaps } from 'vue-yandex-maps'

export default {
  name: 'AddressMap',
  setup() {
    const ymaps = useYmaps()
    return { ymaps }
  },
  data() {
    return {
      searchQuery: '',
      suggestions: [],
      coordinates: [53.9, 27.5667], // Минск
      selectedAddress: '',
      searchTimeout: null,
    }
  },
  methods: {
    async handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      this.searchTimeout = setTimeout(async () => {
        if (!this.searchQuery) {
          this.suggestions = []
          return
        }

        try {
          const response = await fetch(
            `https://geocode-maps.yandex.ru/1.x/?apikey=ac7a06cb-44f3-4fab-ad35-f4a5a3463756&format=json&geocode=${encodeURIComponent(
              this.searchQuery,
            )}`,
          )
          const data = await response.json()

          this.suggestions = data.response.GeoObjectCollection.featureMember.map((item) => ({
            value: item.GeoObject.name,
            coordinates: item.GeoObject.Point.pos.split(' ').map(Number).reverse(),
          }))
        } catch (error) {
          console.error('Ошибка при поиске адреса:', error)
        }
      }, 300)
    },

    selectAddress(suggestion) {
      this.selectedAddress = suggestion.value
      this.coordinates = suggestion.coordinates
      this.suggestions = []
      this.searchQuery = suggestion.value
      this.$emit('address-selected', {
        address: suggestion.value,
        coordinates: suggestion.coordinates,
      })
    },

    async handleMapClick(e) {
      const coords = e.get('coords')
      this.coordinates = coords

      try {
        const response = await fetch(
          `https://geocode-maps.yandex.ru/1.x/?apikey=YOUR_API_KEY&format=json&geocode=${coords[1]},${coords[0]}`,
        )
        const data = await response.json()

        const address = data.response.GeoObjectCollection.featureMember[0].GeoObject.name
        this.selectedAddress = address
        this.searchQuery = address
        this.$emit('address-selected', {
          address: address,
          coordinates: coords,
        })
      } catch (error) {
        console.error('Ошибка при получении адреса:', error)
      }
    },

    handleMarkerDrag(e) {
      const coords = e.get('target').geometry.getCoordinates()
      this.coordinates = coords
      this.handleMapClick({ get: () => coords })
    },
  },
}
</script>

<style scoped>
.address-map {
  width: 100%;
  margin-bottom: 1rem;
  position: relative;
  z-index: 10;
}

.search-container {
  position: relative;
  margin-bottom: 1rem;
  z-index: 12;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 13;
}

.suggestion-item {
  padding: 0.5rem;
  cursor: pointer;
}

.suggestion-item:hover {
  background: #f5f5f5;
}

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
  position: relative;
  z-index: 11;
}

.selected-address {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.address-text {
  font-weight: bold;
  color: #007bff;
}

/* Стили для контейнера карты Яндекс */
:deep(.ymaps-2-1-79-map) {
  z-index: 11;
}

/* Стили для всех элементов управления картой */
:deep(.ymaps-2-1-79-controls__control) {
  z-index: 12;
}
</style>
