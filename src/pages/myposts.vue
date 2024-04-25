<script setup>
import PostSort from '@/k_views/list/PostSort.vue'
import Post from '@/k_views/post/Post.vue'

// import post from '@/views/'
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

const posts = ref([])

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
  const userId = await getUserId()
  const response = await fetch(
    //api/post/read/public/{tableId}/{userId}
    `http://${postAddress}/api/post/read/my/${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    },
  )

  if (!response.ok) {
    alert('실패!')
  } else {
    posts.value = await response.json()
  }
}

getPosts()
</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
      <div
        v-for="(item, index) in posts.slice().reverse()"
        :key="index"
      >
        <Post
          :post="item"
          style="margin-bottom: 20px"
        />
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
      >
        <PostLikeSort style="margin-bottom: 20px" />
      </VCard>
      <VCard
        title="즐겨찾기순"
        style="margin-bottom: 20px"
      >
        <PostStarSort style="margin-bottom: 20px" />
      </VCard>
      <VCard
        title="최신순"
        style="margin-bottom: 20px"
      >
        <PostDateSort style="margin-bottom: 20px" />
      </VCard> -->
    </VCol>
  </VRow>
</template>
