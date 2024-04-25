<script setup>
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter()

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

const statistics = [
  {
    title: 'Sales',
    stats: '245k',
    icon: 'ri-pie-chart-2-line',
    color: 'primary',
  },
  {
    title: 'Customers',
    stats: '12.5k',
    icon: 'ri-group-line',
    color: 'success',
  },
  {
    title: 'Product',
    stats: '1.54k',
    icon: 'ri-macbook-line',
    color: 'warning',
  },
  {
    title: 'Revenue',
    stats: '$88k',
    icon: 'ri-money-dollar-circle-line',
    color: 'info',
  },
]

const wiki = ref([])

async function wikiStarTop5() {
  try {
    const userId = await getUserId()
    const res = await axios.get(`http://${wikiAddress}/api/wikistar/topCounts`, {
      headers: {
        Authorization: authToken,
      },
    })
    wiki.value = res.data
  } catch (error) {
    console.log(error)
  }
}

function readWiki(id) {
  window.location.href = `/readwiki/${id}`
}
wikiStarTop5()
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
          Star
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
          {{ item.starCount }}
        </td>
      </tr>
    </tbody>
  </VTable>
</template>
