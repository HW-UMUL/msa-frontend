<script setup>
import ViewRecentWiki from '@/d_dashboard/ViewRecentWiki.vue'
import ViewWikiLikeRank from '@/d_dashboard/ViewWikiLikeRank.vue'
import ViewWikiStarRank from '@/d_dashboard/ViewWikiStarRank.vue'
import axios from 'axios'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

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
    //alert("인증에 실패하였습니다.")
  } else {
    return response.json()
  }
}

// 토큰 브라우저에서 받아오기
let authToken = 'Bearer '
let jwtToken = auth

authToken = authToken + jwtToken

const router = useRouter()

let isBtnFirst = ref(true)
let isBtnPrev = ref(true)
let isBtnNext = ref(true)
let isBtnLast = ref(true)

let pageNum = ref(0) //페이징 갯수
let list = ref([]) //보여지는 리스트
let pageNumbers = ref([])
let currentPageGroup = ref(1) // 현재 페이지 그룹

const fetchDates = ref([])

async function getList() {
  try {
    const userId = await getUserId()
    const response = await axios.get(`http://${wikiAddress}/api/wiki/read/public/1/${userId}?page=${pageNum.value}`, {
      headers: {
        Authorization: authToken,
      },
    })
    list.value = response.data.content
    const totalPages = response.data.totalPages // 서버에서 받아온 총 페이지 수
    updatePageNumbers(totalPages) // 총 페이지 수를 기반으로 페이지 번호 업데이트

    // 시작 인덱스와 끝 인덱스 계산
    const pageSize = 10 // 한 페이지에 보여지는 아이템의 수
    const startIndex = (pageNum.value - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, list.value.length)

    // fetchDates 배열 초기화
    fetchDates.value = []
    for (let i = 0; i < list.value.length; i++) {
      const res2 = await axios.get(`http://${wikiAddress}/api/wikilog/readall/${list.value[i].wikiId}/${userId}`, {
        headers: {
          Authorization: authToken,
        },
        withCredentials: true,
      })
      fetchDates.value.push(res2.data[0]?.date.substring(0, 10)) // fetchDates 배열에 작성일 추가
    }

    user.value = []
    const userInfo = []

    for (let i = 0; i < list.value.length; i++) {
      const info = await getUserInfo(list.value[i].userId)
      userInfo.push(info)
    }
    user.value = userInfo
    return totalPages
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}
getList()

function sendId(id) {
  router.push({ name: 'readwiki', params: { id } })
}
// 페이지 번호 클릭하여 변경하는 함수
function changePage(pageNumber) {
  // pageNum 값을 pageNumber에 맞게 업데이트
  pageNum.value = pageNumber - 1
  // pageNum 값이 변경되면 리스트를 업데이트하도록 getList 함수 호출
  getList()
}
// 페이지 번호 표시 관련 함수
const updatePageNumbers = totalPages => {
  pageNumbers.value = []
  const startPage = (currentPageGroup.value - 1) * 10 + 1
  const endPage = Math.min(currentPageGroup.value * 10, totalPages)
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.value.push(i)
  }
}

// 페이지 이동 관련 함수
const pageArrow = async direction => {
  const totalPages = await getList() // getTotalPages를 호출하여 totalPages를 가져옴
  switch (direction) {
    case 'first':
      pageNum.value = 0
      currentPageGroup.value = 1
      break
    case 'prev':
      if (currentPageGroup.value > 1) {
        pageNum.value = (currentPageGroup.value - 2) * 10 // 이전 그룹의 첫 번째 페이지로 이동
        currentPageGroup.value-- // 현재 페이지 그룹 변경
      }
      break
    case 'next':
      if (currentPageGroup.value * 10 < totalPages) {
        pageNum.value = currentPageGroup.value * 10
        currentPageGroup.value++
      }
      break
    case 'last':
      pageNum.value = totalPages - 1
      currentPageGroup.value = Math.ceil(totalPages / 10)
      break
    default:
      break
  }
  getList() // 페이지 번호가 업데이트되면 데이터 다시 불러오기

  // 다음 버튼의 활성화 여부 업데이트
  updateButtonState()
}

// 페이지 이동 관련 함수
watch(pageNum, (newVal, oldVal) => {
  // 페이지 번호가 변경될 때마다 버튼 상태 업데이트
  updateButtonState()
})

const updateButtonState = () => {
  isBtnFirst.value = pageNum.value === 0
  isBtnPrev.value = pageNum.value > 0
}

updateButtonState() // 초기 버튼 상태 설정

// 카테고리 관련 데이터와 선택된 카테고리
const categories = ref([])
const selectedCategory = ref('')

// 필터링된 위키 데이터
const filteredWiki = ref([])
async function getFilteredWiki(categoryName) {
  const uid = await getUserId()
  const response = await axios.get(`http://${wikiAddress}/api/category/read/${categoryName}/${uid}`, {
    headers: {
      Authorization: authToken,
    },
    withCredentials: true,
  })
  filteredWiki.value = response.data

  // fetchDates 배열 초기화
  fetchDates.value = []
  for (let i = 0; i < filteredWiki.value.length; i++) {
    const res2 = await axios.get(`http://${wikiAddress}/api/wikilog/readall/${filteredWiki.value[i].wikiId}/${uid}`, {
      headers: {
        Authorization: authToken,
      },
      withCredentials: true,
    })
    fetchDates.value.push(res2.data[0]?.date.substring(0, 10)) // fetchDates 배열에 작성일 추가
  }
}

async function getCategory() {
  const uid = await getUserId()
  const response = await axios.get(`http://${wikiAddress}/api/category/readall/${uid}`, {
    headers: {
      Authorization: authToken,
    },
    withCredentials: true,
  })

  categories.value = response.data
}
getCategory()

const displayedList = ref(list)
async function handleCategoryChange() {
  user.value = []
  const userInfo = []
  if (!selectedCategory.value) {
    // 전체 카테고리를 선택한 경우
    await getList()
    displayedList.value = list.value
  } else {
    // 특정 카테고리를 선택한 경우
    await getFilteredWiki(selectedCategory.value)
    displayedList.value = filteredWiki.value
  }
  for (let i = 0; i < displayedList.value.length; i++) {
    const info = await getUserInfo(displayedList.value[i].userId)
    userInfo.push(info)
  }
  user.value = userInfo
}
const user = ref([])
async function getUserInfo(uid) {
  const response = await fetch(`http://${userAddress}/api/whoAreYou/${uid}`, {
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
    const res = await response.json()
    return res
  }
}
</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
      <VCard>
        <div style="margin-bottom: 20px; display: flex">
          <div>
            <VCardTitle color>Wiki List</VCardTitle>
          </div>
          <div style="margin-top: 12px; margin-left: 200px">
            <!-- 카테고리 선택을 위한 셀렉트 박스 -->
            <select
              v-model="selectedCategory"
              @change="handleCategoryChange"
            >
              <option value="">전체</option>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.name"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>

        <table
          class="wikititle"
          border="0"
          style="border-spacing: 5px; width: 100%; max-height: 300px; overflow-y: auto"
        >
          <tr style="font-weight: bold">
            <td
              width="10%"
              style="padding-left: 10px"
            >
              번호
            </td>
            <td
              style="padding-left: 10px"
              width="55%"
            >
              제목
            </td>
            <td
              align="center"
              width="10%"
            >
              사용자
            </td>
            <td
              align="center"
              width="25%"
            >
              작성일
            </td>
          </tr>
          <tr>
            <td colspan="6"><hr /></td>
          </tr>

          <template
            v-for="(item, idx) in displayedList"
            :key="idx"
          >
            <tr height="40">
              <td
                style="padding-left: 20px"
                width="10%"
              >
                {{ item.wikiId }}
              </td>
              <td width="50%">
                <button
                  type="button"
                  @click="sendId(item.wikiId)"
                  style="color: #905dff"
                >
                  {{ item.wikiTitle }}
                </button>
              </td>
              <td
                width="20%"
                align="center"
              >
                <!-- <GetName :userId="item.userId" /> - {{ item.userId }} -->

                {{ user[idx]?.username }}
              </td>
              <td
                width="20%"
                align="center"
              >
                {{ fetchDates[idx] }}
              </td>
            </tr>
            <tr>
              <td colspan="4"><hr /></td>
            </tr>
          </template>
        </table>
        <br />

        <div style="display: flex; gap: 5px; justify-content: center">
          <ul class="pagination">
            <li
              class="page-item"
              :class="{ disabled: isBtnFirst }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="pageArrow('first')"
                >처음</a
              >
            </li>
            <li
              class="page-item"
              :class="{ disabled: isBtnPrev }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="pageArrow('prev')"
                >이전</a
              >
            </li>
            <!-- 페이지 번호 표시 -->
            <template
              v-for="pageNumber in pageNumbers"
              :key="pageNumber"
            >
              <li
                class="page-item"
                :class="{ active: pageNum === pageNumber }"
              >
                <!-- 페이지 번호 클릭 시 changePage 함수 호출 -->
                <!-- 클릭한 페이지 번호를 매개변수로 전달해야 함 -->
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="changePage(pageNumber)"
                  :class="{ bold: pageNum === pageNumber - 1 }"
                >
                  {{ pageNumber }}
                </a>
              </li>
            </template>
            <li
              class="page-item"
              :class="{ disabled: isBtnNext }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="pageArrow('next')"
                >다음</a
              >
            </li>
            <li
              class="page-item"
              :class="{ disabled: isBtnLast }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="pageArrow('last')"
                >마지막</a
              >
            </li>
          </ul>
        </div>
        <!-- <Post style="margin-bottom: 20px;"/>
  <Post style="margin-bottom: 20px;"/>
  <Post style="margin-bottom: 20px;"/> -->
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

<style scoped>
.bold {
  font-weight: bold;
}

li {
  margin: 10px;
  float: left;
}

ul {
  list-style: none;
}

select {
  -webkit-appearance: none; /* Safari 및 Chrome에서의 appearance 속성 제거 */
  -moz-appearance: none; /* Firefox에서의 appearance 속성 제거 */
  appearance: none; /* 기본 스타일 제거 */
  border: 2px solid;
  padding-right: 20px; /* 오른쪽 여백 추가하여 화살표를 표시할 공간 확보 */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="black"><path d="M10 14a1 1 0 01-.707-.293l-6-6a1 1 0 111.414-1.414L10 11.586l5.293-5.293a1 1 0 111.414 1.414l-6 6A1 1 0 0110 14z"/></svg>'); /* 화살표 SVG 이미지를 배경 이미지로 사용 */
  background-repeat: no-repeat; /* 이미지 반복 설정 */
  background-position: right center; /* 이미지 위치 설정 */
  cursor: pointer;
}
/* 선택된 상태의 select 태그 스타일 */
select:active,
select:focus {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="black"><path d="M10 6a1 1 0 01.707.293l6 6a1 1 0 11-1.414 1.414L10 8.414 4.707 13.707a1 1 0 01-1.414-1.414l6-6A1 1 0 0110 6z"/></svg>'); /* 위쪽 화살표 SVG 이미지를 배경 이미지로 사용 */
}
</style>
