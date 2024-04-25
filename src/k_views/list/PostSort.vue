<script setup>
import PostModal from '@/k_views/post/PostModal.vue';
import axios from 'axios';
import { ref } from 'vue';

const serverAddress = inject('serverAddress')
const auth = inject('auth')
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')

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

const likePosts = ref([])
const starPosts = ref([])
const datePosts = ref([])

const selectedPost = ref([])
const ispostmodal = ref(false)

// 년-월-일
const formatDate = function (value) {
  const date = new Date(value)
  const year = date.getFullYear().toString().slice(-2)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const min = date.getMinutes()
  const sec = date.getSeconds()

  return `${year}-${month}-${day}`
}

// 정렬
const likeSortPosts = ref([])
const starSortPosts = ref([])
const dateSortPosts = ref([])

async function getLikeSorted() {
  const uid = await getUserId()
  const response = await axios.get(`http://${postAddress}/api/postlike/topCounts`, {
    headers: {
      Authorization: `Bearer ${auth}`,
    },
    withCredentials: true,
  })

  if (response.status != 200) {
    console.log(response.status)
  } else {
    likePosts.value = response.data
  }
}

async function getStarSorted() {
  const uid = await getUserId()
  const response = await axios.get(`http://${postAddress}/api/poststar/topCounts`, {
    headers: {
      Authorization: `Bearer ${auth}`,
    },
    withCredentials: true,
  })

  if (response.status != 200) {
    console.log(response.status)
  } else {
    starPosts.value = response.data
  }
}

async function recentWiki() {
  try {
    const userId = await getUserId()
    const res = await axios.get(`http://${postAddress}/api/post/recent`, {
      headers: {
        Authorization: `Bearer ${auth}`,
      },
    })
    datePosts.value = res.data
  } catch (error) {
    console.log(error)
  }
}

recentWiki()
getLikeSorted()
getStarSorted()

function openpostmodal(post) {
  ispostmodal.value = !ispostmodal.value
  selectedPost.value = post
  //App.emit('PostLikeSortModal', true)
}

function closepostmodal() {
  ispostmodal.value = !ispostmodal.value
  console.log(ispostmodal.value)
}

// watch(ispostmodal, (value) => {
//   if (value === true) {
//     document.documentElement.style.overflow = 'hidden'
//   } else {
//     document.documentElement.style.overflow = 'auto'
//   }
// })
</script>

<template>
  <!-- like -->
  <VCard style="margin-bottom: 20px">
    <template #title>
      <div class="text-center">추천순</div>
    </template>
    <VTable class="like">
      <thead>
        <tr>
          <th class="text-center">Title</th>
          <th class="text-uppercase text-center">Like</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, index) in likePosts"
          :key="index"
        >
          <td class="text-center">
            <VIconBtn
              @click="openpostmodal(item)"
              style="cursor: pointer"
            >
              {{ item.title }}
            </VIconBtn>
          </td>
          <td class="text-center">
            <!-- @click="checkLike(item.postId)" -->
            <VIconBtn style="cursor: pointer">
              {{ item.count }}
              <!-- <PostLike :postlike="item" /> -->
            </VIconBtn>
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>

  <!-- star -->
  <VCard style="margin-bottom: 20px">
    <template #title>
      <div class="text-center">즐겨찾기순</div>
    </template>
    <VTable class="star">
      <thead>
        <tr>
          <th class="text-center">Title</th>
          <th class="text-uppercase text-center">Star</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, index) in starPosts"
          :key="index"
        >
          <td
            @click="openpostmodal(item)"
            style="cursor: pointer"
            class="text-center"
          >
            {{ item.title }}
          </td>
          <td class="text-center">
            {{ item.starCount }}
            <!-- <PostStar :poststar="item" /> -->
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>

  <!-- date -->
  <VCard style="margin-bottom: 20px">
    <template #title>
      <div class="text-center">최신순</div>
    </template>
    <VTable>
      <thead>
        <tr>
          <th class="text-center">Title</th>
          <th class="text-uppercase text-center">Date</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(item, index) in datePosts"
          :key="index"
        >
          <td
            class="text-center"
            @click="openpostmodal(item)"
            style="cursor: pointer"
          >
            {{ item.title }}
          </td>
          <td class="text-center">
            {{ formatDate(item.date) }}
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>

  <div
    class="modal-wrap"
    v-if="ispostmodal"
    @click="closepostmodal"
  >
    <div
      class="modal-container"
      @click.stop=""
    >
      <div
        class="modal-body"
        v-if="selectedPost"
      >
        <PostModal :post="selectedPost" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
/* dimmed */
.modal-wrap {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
}
/* modal or popup */
.modal-container {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 550px;
  // background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
}
.modal-body {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
// html {
//   -ms-overflow-style: none; /* IE and Edge */
//   scrollbar-width: none; /* Firefox */
// }
// html::-webkit-scrollbar {
//   display: none; /* Chrome, Safari, Opera*/
// }
</style>
