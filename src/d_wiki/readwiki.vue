<script setup>
import ViewRecentWiki from '@/d_dashboard/ViewRecentWiki.vue'
import ViewWikiLikeRank from '@/d_dashboard/ViewWikiLikeRank.vue'
import ViewWikiStarRank from '@/d_dashboard/ViewWikiStarRank.vue'
import axios from 'axios'
import { reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

authToken = authToken + jwtToken

const route = useRoute()
const router = useRouter()

let date = ''
const state = reactive({
  items: [],
  like: [],
  star: [],
})

const likedItems = reactive([]) // 사용자가 좋아하는 항목의 ID를 저장하는 배열
const starredItems = reactive([])

readWiki()
async function readWiki() {
  const userId = await getUserId()
  axios
    .get(`http://${wikiAddress}/api/wiki/read/${route.params.id}/${userId}`, {
      headers: {
        Authorization: authToken,
      },
    })
    .then(res => {
      state.items = res.data
      date = new Date(state.items?.wikiCreateDt)

      date =
        date.getFullYear() +
        '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        date.getDate().toString().padStart(2, '0') +
        ' ' +
        date.getHours().toString().padStart(2, '0') +
        ':' +
        date.getMinutes().toString().padStart(2, '0') +
        ':' +
        date.getSeconds().toString().padStart(2, '0')

      getLikes(state.items?.wikiId)
      getStars(state.items?.wikiId)

      axios
        .get(`http://${wikiAddress}/api/wikilike/readLikePersonal/${state.items?.wikiId}/${userId}`, {
          headers: {
            Authorization: authToken,
          },
        })
        .then(res2 => {
          state.like = res2.data
          if (state.like.wiki != undefined) {
            likedItems.push(state.like?.wiki.wikiId)
          }
        })

      axios
        .get(`http://${wikiAddress}/api/wikistar/readStarPersonal/${state.items?.wikiId}/${userId}`, {
          headers: {
            Authorization: authToken,
          },
        })
        .then(res3 => {
          state.star = res3.data
          if (state.star.wiki != undefined) {
            starredItems.push(state.star.wiki.wikiId)
          }
        })
    })
}

function sendIdToUpdate(id) {
  router.push({ path: `/updatewiki/${id}` })
}

function sendIdToViewLogs(id) {
  router.push({ path: `/wikilog/${id}` })
}

async function deleteAlert() {
  if (confirm('정말로 삭제하시겠습니까?')) {
    const userId = await getUserId()
    axios
      .delete(`http://${wikiAddress}/api/wiki/delete/${route.params.id}/${userId}`, {
        headers: {
          Authorization: authToken,
        },
      })
      .then(res => {
        // 삭제가 성공하면 어떤 동작을 수행할지 정의
        router.push('/wiki')
      })
      .catch(error => {
        console.error('삭제 중 에러가 발생했습니다:', error)
      })
  }
}

const likestar = reactive({
  like: {},
  star: {},
})

async function toggleLike(wikiId) {
  if (isLiked(wikiId)) {
    likedItems.splice(likedItems.indexOf(wikiId), 1)
  } else {
    likedItems.push(wikiId)
  }
  await checkLike(wikiId)
}

async function toggleStar(wikiId) {
  if (isStarred(wikiId)) {
    starredItems.splice(starredItems.indexOf(wikiId), 1)
  } else {
    starredItems.push(wikiId)
  }

  await checkStar(wikiId)
}

function isLiked(wikiId) {
  return likedItems.includes(wikiId)
}

function isStarred(wikiId) {
  return starredItems.includes(wikiId)
}

async function checkLike(wikiId) {
  const userId = await getUserId()
  const res = await axios
    .create({
      baseURL: `http://${wikiAddress}/api/wikilike/check/${wikiId}/${userId}`,
      headers: { Authorization: authToken },
      withCredentials: true,
    })
    .post()

  getLikes(wikiId)
}

async function checkStar(wikiId) {
  const userId = await getUserId()
  const res = await axios
    .create({
      baseURL: `http://${wikiAddress}/api/wikistar/check/${wikiId}/${userId}`,
      headers: { Authorization: authToken },
      withCredentials: true,
    })
    .post()

  getStars(wikiId)
}

async function getLikes(wikiId) {
  const res = await axios
    .create({
      baseURL: `http://${wikiAddress}/api/wikilike/read/${wikiId}`,
      headers: { Authorization: authToken },
      withCredentials: true,
    })
    .get()
  const likes = res.data
  // 객체 내에서 wikiId를 키로 사용하여 값 업데이트
  likestar.like[wikiId] = likes
}

async function getStars(wikiId) {
  const res = await axios
    .create({
      baseURL: `http://${wikiAddress}/api/wikistar/read/${wikiId}`,
      headers: { Authorization: authToken },
      withCredentials: true,
    })
    .get()
  const stars = res.data
  // 객체 내에서 wikiId를 키로 사용하여 값 업데이트
  likestar.star[wikiId] = stars
}

const cancelForm = () => {
  // 이전 페이지로 이동
  router.push(`/wiki`)
}

// 옵션 목록을 토글하는 함수
function toggleOptions() {
  var optionList = document.getElementById('optionList')
  optionList.style.display === 'none' ? (optionList.style.display = 'block') : (optionList.style.display = 'none')
}

async function getUserInfo() {
  const response = await fetch(`http://${userAddress}/api/whoAreYou/${state.items.userId}`, {
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
    user.value = await response.json()
  }
}

watchEffect(() => {
  try {
    if (state.items.userId) {
      getUserInfo().then(() => {
        signal.value = true
      })
    }
  } catch (error) {}
})
const signal = ref(false)
const user = ref()
</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
      <VCard>
        <div style="margin-top: 2em; margin-left: 3em; display: flex; justify-content: space-between">
          <div style="text-align: left; color: #905dff; margin: 10px">{{ state.items.category?.name }}</div>
          <div style="margin: 10px; margin-left: auto">
            <button
              type="button"
              @click="toggleLike(state.items?.wikiId)"
              :class="{ active: isLiked(state.items?.wikiId) }"
            >
              <font-awesome-icon :icon="isLiked(state.items?.wikiId) ? ['fas', 'thumbs-up'] : ['far', 'thumbs-up']" />
            </button>
            {{ likestar.like[state.items?.wikiId] }}
          </div>
          <div style="margin: 10px; float: right">
            <button
              type="button"
              @click="toggleStar(state.items?.wikiId)"
              :class="{ active: isStarred(state.items?.wikiId) }"
            >
              <font-awesome-icon :icon="isStarred(state.items?.wikiId) ? ['fas', 'star'] : ['far', 'star']" />
            </button>
            {{ likestar.star[state.items?.wikiId] }}
          </div>

          <div class="kebab-container">
            <div
              style="margin: 10px; margin-right: 3.5em"
              class="kebab-icon"
              @click="toggleOptions()"
            >
              •••
            </div>

            <!-- 옵션 목록 -->
            <ul
              class="option-list"
              id="optionList"
            >
              <li><a @click="sendIdToViewLogs(state.items?.wikiId)">변경 이력</a></li>
              <li><a @click="sendIdToUpdate(state.items?.wikiId)">수정</a></li>
              <li><a @click="deleteAlert()">삭제</a></li>
            </ul>
          </div>
        </div>
        <div
          width="100%"
          style="color: gray; margin-left: 3em"
        >
          <h1>{{ state.items?.wikiTitle }}</h1>
          <p v-if="signal">&nbsp; {{ user.username }} &nbsp; {{ date }}에 최종 변경</p>
          <!-- <p>&nbsp;{{ state.items.user?.username }} &nbsp; {{ date }}에 최종 변경</p> -->
        </div>
        <br />
        <div
          v-html="`${state.items?.wikiContent}`"
          style="margin-left: 3em; margin-right: 3em; height: 50%"
        />

        <div
          class="button-container"
          align="center"
          style="flex: auto; float: right; margin-bottom: 1em; margin-right: 1em"
        >
          <VBtn @click="cancelForm"> 목록</VBtn>
        </div>
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
  <!-- <button v-if="isAuthorized" @click="edit">수정</button> -->
</template>

<style>
.button-container button {
  margin-right: 10px; /* 각 버튼 오른쪽에 마진을 추가합니다. */
}
/* 케밥 메뉴 아이콘 스타일링 */
.kebab-container {
  position: relative; /* 컨테이너를 상대 위치로 설정 */
  display: inline-block; /* 컨테이너를 인라인 블록 요소로 표시하여 텍스트와 함께 사용 가능하도록 함 */
}

.kebab-icon {
  cursor: pointer;
}

/* 옵션 목록 스타일링 */
.option-list {
  display: none;
  position: absolute; /* 절대 위치로 설정하여 아이콘과 컨테이너에 따라 이동함 */
  top: 100%; /* 아이콘 아래에 표시되도록 함 */
  left: 0; /* 왼쪽 정렬 */
  background-color: #fff;
  padding: 10px;
  border: 1px solid #ccc;
}

.option-list li {
  list-style-type: none;
  padding: 5px 0;
}
</style>
