<script setup>
import { ref } from 'vue';
import AdminPostModal from '@/k_views/admin/AdminPostModal.vue';
import App from '@/App.vue';

const props = defineProps({
    user: Object
})

// 년-월-일
const formatDate = function(value) {
    const date = new Date(value);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1);
    const day = date.getDate();

    return `${year}-${month}-${day}`;
}

const postAddress = inject('postAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

// User Post
async function getUserPosts() {
  try {
    const response = await fetch(
      `http://${postAddress}/api/post/read/my/${props.user.id}`,
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
      const likes = await getLikes(post.postId)
      const stars = await getStars(post.postId)
      const userInfo = await getUserInfo(post.userId)
      return { ...post, likes: likes, stars: stars, userInfo: userInfo }
    }))

    sortedPosts.value = [...posts.value]; // 정렬된 배열
    issort()
  } catch (error) {
    console.error(error)
  }
}

getUserPosts()

async function getUserInfo(postId){
  const response = await fetch(
    `http://${userAddress}/api/whoAreYou/${postId}`,
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
    const user= await response.json();
    return user;
  }

}

async function getLikes(postId){

const response = await fetch(
  `http://${postAddress}/api/postlike/read/${postId}`,
  {
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
      },
      credentials: 'include'
  }
)

if(!response.ok) {
  console.error()
} else{
  const likes = await response.json()
  return likes
}
}

async function getStars(postId) {

  const response = await fetch(
    `http://${postAddress}/api/poststar/read/${postId}`, {
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
  return stars
}
}

// 정렬

const sortDirection = ref('desc')
const sortBy = ref('id')

function togglesort(sortType) {
  if (sortBy.value === sortType) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = sortType;
    sortDirection.value = 'asc';
  }
  issort()
}

function issort() {
  sortBy.value === 'id';
  sortBy.value === 'like';
  sortBy.value === 'star';
  sortBy.value === 'date';
  // 체크박스 확인
  const checkedPostIds = checkedPosts.value.map((checked, index) => checked ? sortedPosts.value[index].id : null);
  sortedPosts.value.sort((a, b) => {
    const compareResult = sortDirection.value === 'asc' ? -1 : 1;
    switch (sortBy.value) {
      case 'id':
        return compareResult * (a.postId - b.postId);
      case 'title':
        return compareResult * (a.postTitle.localeCompare(b.postTitle))
      case 'writer':
        return compareResult * (a.userInfo.username.localeCompare(b.userInfo.username))
      case 'like':
        return compareResult * (a.likes - b.likes);
      case 'star':
        return compareResult * (a.stars - b.stars);
      case 'date':
        return compareResult * (new Date(a.postCreateDt) - new Date(b.postCreateDt));
      default:
        return 0;
    }
  })
  // 체크박스 확인
  checkedPosts.value = sortedPosts.value.map(post => checkedPostIds.includes(post.postId));
}

const serverAddress = inject('serverAddress')

const sortedPosts = ref([])
const posts = ref([])
const selectedPost = ref([])
const ispostmodal = ref(false)

function openpostmodal(post) {
  ispostmodal.value = !ispostmodal.value
  selectedPost.value = post
  App.emit('PostLikeSortModal', true)
}

function closepostmodal() {
  ispostmodal.value = !ispostmodal.value
}

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

async function delPost(postId) {
  const userId = await getUserId()
  const response = await fetch(
    `http://${postAddress}/api/post/delete/${postId}/${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`,
      },
      credentials: 'include'
    }
  )
  if(!response.ok) {
    alert(postId+"를 삭제할 수 없습니다.")
    console.error()
  } else {
    // alert("삭제되었습니다")
    getUserPosts()
    // window.location.reload()
  }
}

const checkedPosts = ref([])
async function delcheckedposts() {
  const delPostList = [];

  checkedPosts.value.forEach((checked, index) => {
    if (checked) {
      delPostList.push(sortedPosts.value[index].postId);
    }
  })
  if(delPostList.length === 0) {
    alert("삭제할 게시물을 선택하십시오.");
    return;
  }
  const confirmdel = confirm("삭제하시겠습니까?");
  if(!confirmdel) return;

  try {
    for(const postId of delPostList) {
    await delPost(postId);
  }
  checkedPosts.value = [];
  alert("삭제되었습니다");
  } catch(error) {
    console.error(error);
    alert("삭제 실패");
  }
}

const allChecked = ref(false);

// 전체 체크박스 클릭 시 개별 체크박스 상태 업데이트
function selectAllCheckboxes() {
  checkedPosts.value = sortedPosts.value.map(() => allChecked.value);
}

// 개별 체크박스 클릭 시 전체 선택 체크박스 상태 업데이트
function selectIndividualCheckbox(index) {
  checkedPosts.value[index] = !checkedPosts.value[index];
  allChecked.value = checkedPosts.value.every(checked => checked);
}
</script>

<template>
  <div style="margin: 10px;
    display: flex;
    justify-content: space-between">
    <span
      style="font-size: small;
      margin-left: 10px;">
      total : {{ posts.length }}
    </span>
    <VIconBtn
      style="margin-right: 10px;
      cursor: pointer"
      @click="delcheckedposts">
      삭제
    </VIconBtn>
  </div>
  <VTable
  density="comfortable"
  fixed-header
  height="440"
  >
    <thead>
      <tr>
        <th class="text-center">
          No
          <VIcon size="12pt"
            :icon="sortBy === 'id' ? (sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line') : 'ri-subtract-line'"
            @click="togglesort('id')" />
        </th>
        <th class="text-center" >
          Title
          <VIcon size="12pt"
            :icon="sortBy === 'title' ? (sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line') : 'ri-subtract-line'"
            @click="togglesort('title')" />
        </th>
        <th class="text-center">
          Writer
          <VIcon size="12pt"
            :icon="sortBy === 'writer' ? (sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line') : 'ri-subtract-line'"
            @click="togglesort('writer')" />
        </th>
        <th class="text-center">
          Like
          <VIcon
            size="12pt"
            :icon="sortBy === 'like' ? (sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line') : 'ri-subtract-line'"
            @click="togglesort('like')" />
        </th>
        <th class="text-center">
          Star
          <VIcon
            size="12pt"
            :icon="sortBy === 'star' ? (sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line') : 'ri-subtract-line'"
            @click="togglesort('star')" />
        </th>
        <th class="text-center">
          Date
          <VIcon
           size="12pt" 
           :icon="sortBy === 'date' ? (sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line') : 'ri-subtract-line'"
           @click="togglesort('date')" />
        </th>
        <th class="text-center">
          <input 
            type="checkbox"
            v-model="allChecked"
            @change="selectAllCheckboxes">
        </th>
      </tr>
    </thead>
  
    <tbody>
      <tr v-for="(item, index) in sortedPosts" :key="index">
        <td class="text-center" style="width: 60pt">
          {{ item.postId }}
        </td>
        <td>
          <VIconBtn 
            class="text-center"
            @click="openpostmodal(item)"
            style="cursor: pointer; color: #8C57FF;">
            {{ item.postTitle }}
          </VIconBtn>
        </td>
        <td class="text-center" style="width: 100pt">
          {{ item.userInfo.username }}
        </td>
        <td class="text-center" style="width: 100pt">
          {{ item.likes }}
        </td>
        <td class="text-center" style="width: 100pt">
          {{ item.stars }}
        </td>
        <td class="text-center" style="width: 150pt">
        {{ formatDate(item.postCreateDt) }}
        </td>
        <td class="text-center" style="width: 50px;">
          <input 
            type="checkbox"
            :checked="checkedPosts[index]"
            @change.stop="selectIndividualCheckbox(index)"
            >
        </td>
      </tr>
    </tbody>
  </VTable>
  
  <div class="post-wrap" v-if="ispostmodal" @click="closepostmodal">
    <div class="post-container" @click.stop="">
      <div class="post-body" v-if="selectedPost">
        <VCol>
          <VCol>
            <div style="display: flex; justify-content: flex-end;" @click="closepostmodal">
              <VIcon icon="ri-close-line" style="cursor:pointer;" />
            </div>
          </VCol>
        </VCol>
        <AdminPostModal :post="selectedPost" />
      </div>
    </div>
  </div>
  </template>

<style lang="scss">
  /* dimmed */
  .post-wrap {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    z-index: 100;
  }
  /* modal or popup */
  .post-container {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
//    width: 550px;
//    width: 1000%;
    // background: #fff;
    border-radius: 10px;
    padding: 20px;
    box-sizing: border-box;
  }
  .post-body {
    background-color: #ffffff;
    position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

    max-height: calc(100vh - 200px);
    overflow-y: auto;
    width:150%;
  }
// html {
//   -ms-overflow-style: none; /* IE and Edge */
//   scrollbar-width: none; /* Firefox */
// }
// html::-webkit-scrollbar {
//   display: none; /* Chrome, Safari, Opera*/
// }
</style>
