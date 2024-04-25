<script setup>
import { ref } from 'vue';
import PostModal from '@/k_views/post/PostModal.vue';

const serverAddress = inject('serverAddress')
const auth = inject('auth')
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')


async function getUserId() {
  const response = await fetch(
    `http://${userAddress}/api/getuserid`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`, 
      },
      credentials: 'include'
    }
  )

  if(!response.ok){
    alert("인증에 실패하였습니다.")
  } else{
    return response.json();
  }

}

const posts = ref([])
const selectedPost = ref([])
const ispostmodal = ref(false)

// 년-월-일
const formatDate = function(value) {
    const date = new Date(value);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1);
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    
    return `${year}-${month}-${day}`;
}

// 정렬
const starSortPosts = ref([])

async function getPosts() {
  const userId = await getUserId();
  try {
    const response = await fetch(
      `http://${postAddress}/api/post/read/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        credentials: 'include'
      }
    );
    if (!response.ok) {
      console.error()
    }
    const beforePosts = await response.json()
    
    posts.value = await Promise.all(beforePosts.map(async (post) => {
      const stars = await getStars(post.postId);
      return { ...post, stars: stars };
    }))
    starSortPosts.value = [...posts.value].sort((a, b) => b.stars - a.stars);

  } catch (error) {
    console.error(error)
  }
}

getPosts()

// star
async function getStars(postId) {
  const response = await fetch(`http://${postAddress}/api/poststar/read/${postId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth}`
    },
    credentials: 'include'
  })

  if (!response.ok) {
    console.error()
  } else{
  const stars = await response.json()
  return stars;
}
}

async function checkStar(postId){
  const userId = await getUserId()

const response = await fetch(
    `http://${postAddress}/api/poststar/check/${postId}/${userId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`
      },
      credentials: 'include'
    }
)

if(!response.ok) {
  console.error(error)
} else{
  getPosts()
}
}

function openpostmodal(post) {
  ispostmodal.value = !ispostmodal.value
  selectedPost.value = post
//  App.emit('PostLikeSortModal', true)
}

function closepostmodal() {
  ispostmodal.value = !ispostmodal.value
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

<!-- star -->
<VCard style="margin-bottom: 20px;">
    <template #title>
        <div class="text-center">즐겨찾기순</div>
    </template>
    <VTable density="comfortable">
        <thead>
        <tr>
            <th class="text-center" >
            Title
            </th>
            <th class="text-uppercase text-center">
            Star
            </th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="(item, index) in starSortPosts.slice(0,5)" :key="index">
            <td class="left-aligned">
            <VIconBtn @click="openpostmodal(item)" style="cursor: pointer;">
                {{ item.postTitle }}
            </VIconBtn>
            </td>

            <td class="text-center">
            <VIconBtn @click="checkStar(item.id)" style="cursor: pointer;">
                {{ item.stars }}
            </VIconBtn>
            </td>
        </tr>
        </tbody>
    </VTable>
</VCard>

<div class="modal-wrap" v-if="ispostmodal" @click="closepostmodal">
  <div class="modal-container" @click.stop="">
    <div class="modal-body" v-if="selectedPost">
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