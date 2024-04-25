<script setup>
import PostSort from '@/k_views/list/PostSort.vue';
import Post from '@/k_views/post/Post.vue';

// import post from '@/views/'
import { watchEffect } from 'vue';

const serverAddress = inject('serverAddress')
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

const props = defineProps({
  keyword: String,
})

const posts = ref([])

const size = 10 // 페이지 당 아이템 수
let page = 0

const loading = ref(false) // 데이터를 불러오는 중인지 여부를 나타내는 상태 변수
const hasMore = ref(true) // 더 많은 데이터를 가져올 수 있는지 여부를 나타내는 상태 변수

watchEffect(() => {
  if (props.keyword == null) {
    getPosts()
  } else {
    searchPost()
  }
})

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

async function getPosts() {
  if (!hasMore.value) return // 더 이상 가져올 데이터가 없으면 종료
  const userId = await getUserId()
  const response = await fetch(
    //api/post/read/public/{tableId}/{userId}
    `http://${postAddress}/api/post/read/publics/1/${userId}?page=${page}&size=${size}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

  const newData = await response.json()
  if (newData.content.length === 0) {
    hasMore.value = false // 더 이상 가져올 데이터가 없음을 표시
  } else {
    // 새로운 페이지의 글과 이전 페이지의 글을 합침
    posts.value = [...posts.value, ...newData.content]
    page++ // 페이지 번호 증가
  }
}

async function searchPost() {
  const userId = await getUserId()
  const response = await fetch(`http://${postAddress}/api/post/search/${props.keyword}/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    //alert('실패!')
  } else {
    posts.value = await response.json()
  }
}

// if (props.keyword == null) {
//   getPosts()
// }

// 스크롤 이벤트 리스너 등록
window.addEventListener('scroll', handleScroll)

async function handleScroll() {
  // 이미 데이터를 불러오고 있거나 더 이상 가져올 데이터가 없는 경우 종료
  if (loading.value || !hasMore.value) return

  // 스크롤이 아래로 내려간 거리
  const scrollY = window.scrollY

  // 윈도우의 높이
  const windowHeight = window.innerHeight

  // 문서의 높이
  const documentHeight = document.body.scrollHeight

  // 스크롤이 문서의 맨 아래에 도달하면 새로운 페이지 데이터를 가져옴
  if (scrollY + windowHeight >= documentHeight) {
    loading.value = true // 데이터를 불러오는 중임을 표시
    await getPosts() // 새로운 페이지 데이터를 가져옴
    loading.value = false // 데이터를 불러오는 중이 아님을 표시
  }
}
</script>

<template>
  <VRow class="position-relatives">
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
      <div v-if="posts && posts.length">
        <div
          v-for="(item, index) in posts"
          :key="index"
        >
          <Post
            :post="item"
            :index="index"
            style="margin-bottom: 20px"
          />
        </div>
      </div>
      <div v-else>
        <p>No posts found</p>
      </div>
      <div v-if="loading">
        <p>Loading...</p>
      </div>
    </VCol>
    <VCol
      cols="12"
      md="4"
    >
      <PostSort />
      <!-- <VCard
        title="추천순"
        style="margin-bottom: 20px"
        class="like"
      >
        <PostLikeSort style="margin-bottom: 20px" />
      </VCard>

      <VCard
        title="즐겨찾기순"
        style="margin-bottom: 20px"
        class="star"
      >
        <PostStarSort style="margin-bottom: 20px" />
      </VCard>

      <VCard
        title="최신순"
        class="date"
        style="margin-bottom: 20px"
      >
        <PostDateSort style="margin-bottom: 20px" />
      </VCard> -->
    </VCol>
  </VRow>
</template>
