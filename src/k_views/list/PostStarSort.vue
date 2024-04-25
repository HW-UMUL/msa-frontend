<script setup>
import { onMounted, ref } from 'vue';
import PostStar from '@/k_views/star/PostStar.vue';
import PostModal from '@/k_views/post/PostModal.vue';

const serverAddress = inject('serverAddress')
const postAddress = inject('postAddress')
const auth = inject('auth')
const userAddress = inject('userAddress')

const posts = ref([])

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

async function getPosts() {
  try {
    const userId = await getUserId();
    const response = await fetch(
      `http://${postAddress}/api/post/read/public/1/${userId}`,
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
      alert("실패!")
    }
    const beforePosts = await response.json()
    
    posts.value = await Promise.all(beforePosts.map(async (post) => {
      const stars = await getStars(post.postId)
      return { ...post, stars: stars }
    }))

    posts.value.sort((a, b) => b.stars - a.stars)

  } catch (error) {
    console.error(error)
    alert("실패!")
  }
}

onMounted(getPosts)

async function getStars(postId) {
  try {
    const userId = await getUserId();
    const response = await fetch(`http://${postAddress}/api/poststar/read/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`
      },
      credentials: 'include'
    })

    if (!response.ok) {
    //   alert("실패!")
    }
    const stars = await response.json()
    return stars
  } catch (error) {
    console.error(error)
    // alert("실패!")
  }
}



const selectedPost = ref([])
const ispostmodal = ref(false)

function openpostmodal(post) {
  ispostmodal.value = !ispostmodal.value
  selectedPost.value = post
}

function closepostmodal() {
  ispostmodal.value = !ispostmodal.value
  console.log(ispostmodal.value)
}

</script>

<template>
  <VTable>  
    <thead>
      <tr>
        <th class="text-center">
          Title
        </th>
        <th class="text-uppercase text-center">
          Star
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(item, index) in posts.slice(0,5)" :key="index">
        <td @click="openpostmodal(item)" style="cursor: pointer;" class="text-center">
          {{ item.postTitle }}
        </td>
        <td class="text-center">
          <PostStar :poststar="item" />
        </td>
      </tr>
    </tbody>
  </VTable>

  <div class="modal-wrap" v-if="ispostmodal" @click="closepostmodal">
  <div class="modal-container" @click.stop="">
    <div class="modal-body" v-if="selectedPost">
      <PostModal :post="selectedPost" />
    </div>
  </div>
</div>

</template>
