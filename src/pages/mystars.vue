<script setup>
import ViewRecentWiki from '@/d_dashboard/ViewRecentWiki.vue';
import ViewWikiLikeRank from '@/d_dashboard/ViewWikiLikeRank.vue';
import ViewWikiStarRank from '@/d_dashboard/ViewWikiStarRank.vue';
import PostSort from '@/k_views/list/PostSort.vue';
import Post from '@/k_views/post/Post.vue';
import MyStarWikiList from '@/views/wiki/MyStarWikiList.vue';

const serverAddress = inject('serverAddress')
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')

const auth = inject('auth')

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

async function getPosts(){
  const userId = await getUserId()

  const response = await fetch(
    `http://${postAddress}/api/poststar/read/my/${userId}`,
   {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`,          
      },
      credentials: 'include'
    }
)

if(!response.ok) {
  alert("실패!")
} else{
  posts.value = await response.json()
}
}


getPosts()

const changePostWiki = ref(true)

</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
    <VRow style="height: 30px; margin-bottom: 20px;">
      <div class="selectPostWiki" @click="changePostWiki=true">POST</div>
      <div class="bar"></div>
      <div class="selectPostWiki" @click="changePostWiki=false">WIKI</div>
    </VRow>
      <div v-if="changePostWiki" v-for="(item, index) in posts" :key="index">
        <Post :post="item.post" style="margin-bottom: 20px;"/>       
      </div>
      <div v-if="!changePostWiki">
        <MyStarWikiList/>
      </div>
    </VCol>  
    <VCol
      cols="12"
      md="4"
    >
    <PostSort v-if="changePostWiki"/>
      <VCard v-if="!changePostWiki"
        title="추천순"
        style="margin-bottom: 20px"
      >
        <ViewWikiLikeRank style="margin-bottom: 20px" />
      </VCard>
      <VCard v-if="!changePostWiki"
        title="즐겨찾기순"
        style="margin-bottom: 20px"
      >
        <ViewWikiStarRank style="margin-bottom: 20px" />
      </VCard>
      <VCard v-if="!changePostWiki"
        title="최신순"
        style="margin-bottom: 20px"
      >
        <ViewRecentWiki style="margin-bottom: 20px" />
      </VCard>
    </VCol>  

  </VRow>
</template>
<style lang="scss">
@use "@core/scss/pages/page-auth.scss";
.selectPostWiki{
  align-items: center;
  width: 49%;
  display: flex;
  justify-content: center;
  font-size: 20px; 
//  font-weight: bold;
}

.bar {
    width: 1px; /* 바의 너비 */
    background-color: gray; /* 바의 배경색 */
}
</style>
