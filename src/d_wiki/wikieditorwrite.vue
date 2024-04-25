<script setup>
import MyEditor from '@/d_wiki/wikieditor.vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import ViewRecentWiki from '@/d_dashboard/ViewRecentWiki.vue'
import ViewWikiLikeRank from '@/d_dashboard/ViewWikiLikeRank.vue'
import ViewWikiStarRank from '@/d_dashboard/ViewWikiStarRank.vue'

const router = useRouter()
const route = useRoute()

const serverAddress = inject('serverAddress')
const wikiAddress = inject('wikiAddress')
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


// 토큰 브라우저에서 받아오기
let authToken = 'Bearer '
let jwtToken = auth

authToken = authToken + jwtToken

const formData = ref({
  title: '',
  content: '',
  category: '',
})

getWiki()
async function getWiki(){
  if (route.params.id) {
    const userId = await getUserId()
    axios
      .get(`http://${wikiAddress}/api/wiki/read/${route.params.id}/${userId}`, {
        headers: {
          Authorization: authToken,
        },
      })
      .then(res => {
        formData.value.title = res.data.wikiTitle
        formData.value.content = res.data.wikiContent
        formData.value.category = res.data.category.name
      })
  }
}

async function submitForm() {
  // 헤더 정보 설정
  const headers = {
    'Content-Type': 'application/json',
    Authorization: authToken,
  }

  // 서버로 보낼 데이터
  const data = JSON.stringify(formData.value)
  const userId = await getUserId()
  // POST 요청 보내기
  axios
    .post(`http://${wikiAddress}/api/wiki/create/${userId}`, data, { headers })
    .then(response => {
      // 서버로부터의 응답에 따라 적절한 동작을 수행할 수 있음.
      // ex) 성공 메시지를 표시하거나 페이지를 리디렉션할 수 있음.

      // const router = useRouter()  -- 라우터로 리다이렉트 하기 위한 코드. 잘 안됨. 보류.
      // router.push(route.query.redirect || '/dashboard');
      router.go(-1)
//      router.push({ path: '/wiki' })
    })
    .catch(error => {
      console.error('에러 발생:', error)
      // 에러 처리 로직을 추가할 수 있습니다.
    })
}
const props = defineProps({
  posts: Array,
})

const cancelForm = () => {
  // 이전 페이지로 이동
  router.go(-1)
}
</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
      <VCard class="position-relative">
        <VCardText>
          <div>
            <p>Wiki 작성</p>
            <VCol>
              <VTextField
                id="title"
                v-model="formData.title"
                placeholder="제목"
                label="제목"
              >
              </VTextField>
            </VCol>

            <VCol>
              <div>
                <MyEditor v-model="formData.content" />
              </div>

              <!-- <VTextarea
            id="content"
            v-model="post.content"
            placeholder="본문"
            label="본문"
            /> -->
            </VCol>

            <VCol>
              <VTextField
                id="category"
                v-model="formData.category"
                placeholder="카테고리"
                label="카테고리"
              />
            </VCol>

            <VCol cols="12">
              <VBtn
                @click="submitForm"
                type="submit"
                class="me-5"
              >
                작성
              </VBtn>
              <VBtn
                @click="cancelForm"
                type="button"
                >취소</VBtn
              >

              <!-- <VBtn
              color="secondary"
              type="reset"
              variant="outlined"
            >
              Reset
            </VBtn> -->
            </VCol>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="4"
    >
      <VCard
        title="추천순"
        style="margin-bottom: 20px"
      >
        <ViewWikiLikeRank style="margin-bottom: 20px" />
      </VCard>
      <VCard
        title="즐겨찾기순"
        style="margin-bottom: 20px"
      >
        <ViewWikiStarRank style="margin-bottom: 20px" />
      </VCard>
      <VCard
        title="최신순"
        style="margin-bottom: 20px"
      >
        <ViewRecentWiki style="margin-bottom: 20px" />
      </VCard>
    </VCol>
  </VRow>
</template>

