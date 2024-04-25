<!-- eslint-disable no-restricted-imports -->
<script setup>
import { hexToRgb } from '@layouts/utils'
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const router = useRouter()
const route = useRoute()

// 토큰 브라우저에서 받아오기
const serverAddress = inject('serverAddress')
const wikiAddress = inject('wikiAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

async function getUserId() {
  const response = await fetch(`http://${userAddress}/api/getuserid`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    alert('인증에 실패하였습니다.')
  } else {
    return response.json()
  }
}

// 토큰 브라우저에서 받아오기
let authToken = 'Bearer '
let jwtToken = auth

authToken = authToken + auth

const vuetifyTheme = useTheme()

const series = [
  {
    data: [0, 20, 5, 30, 15, 45],
  },
]

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
    },
    tooltip: { enabled: false },
    grid: {
      borderColor: `rgba(${hexToRgb(String(variableTheme['border-color']))},${variableTheme['border-opacity']})`,
      strokeDashArray: 6,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: {
        top: -10,
        left: -7,
        right: 5,
        bottom: 5,
      },
    },
    stroke: {
      width: 3,
      lineCap: 'butt',
      curve: 'straight',
    },
    colors: [currentTheme.primary],
    markers: {
      size: 6,
      offsetY: 4,
      offsetX: -2,
      strokeWidth: 3,
      colors: ['transparent'],
      strokeColors: 'transparent',
      discrete: [
        {
          size: 5.5,
          seriesIndex: 0,
          strokeColor: currentTheme.primary,
          fillColor: currentTheme.surface,
          dataPointIndex: series[0].data.length - 1,
        },
      ],
      hover: { size: 7 },
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { labels: { show: false } },
  }
})

const wiki = ref([])

async function wikiLikeTop5() {
  try {
    const userId = await getUserId()
    const res = await axios.get(`http://${wikiAddress}/api/wikilike/topCounts`, {
      headers: {
        Authorization: authToken,
      },
    })
    wiki.value = res.data
  } catch (error) {
    console.log(error)
  }
}

// readWiki 함수 정의: 목적지 경로로 이동하는 함수
const readWiki = id => {
  window.location.href = `/readwiki/${id}`
}

wikiLikeTop5()
</script>

<template>
  <VTable>
    <thead>
      <tr>
        <th
          class="text-center"
          style="width: 50%"
        >
          Title
        </th>
        <th
          class="text-uppercase text-center"
          style="width: 50%"
        >
          Like
        </th>
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="(item, idx) in wiki"
        :key="idx"
      >
        <td class="text-center">
          <a @click="readWiki(item.wikiId)">{{ item.title }}</a>
        </td>
        <td class="text-center">
          {{ item.count }}
        </td>
      </tr>
    </tbody>
  </VTable>
</template>
