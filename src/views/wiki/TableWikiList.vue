<script setup>
import axios from 'axios'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GetName from '@/components/GetName.vue'
import ViewRecentWiki from '@/d_dashboard/ViewRecentWiki.vue'
import ViewWikiLikeRank from '@/d_dashboard/ViewWikiLikeRank.vue'
import ViewWikiStarRank from '@/d_dashboard/ViewWikiStarRank.vue'

const serverAddress = inject('serverAddress')
const wikiAddress = inject('wikiAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

const props = defineProps({
  tableId: String,
})

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

const router = useRouter()

const firstDate = ref([])
const list = ref([]) //보여지는 리스트
const list2 = ref([]) // 카테고리 필터링 리스트
const cache = ref([]) //리스트 전체

const listCunt = ref('10') // 한 페이지에 노출될 게시글 개수

let currentPage = ref(0) //현재 페이지
let pageNum = 10 //페이징 갯수
const pageList = ref([]) // 보여지는 페이지 리스트
let totalPage = ref(0) //페이지 숫자

let isBtnFirst = ref(true)
let isBtnPrev = ref(true)
let isBtnNext = ref(true)
let isBtnLast = ref(true)

const currentPageListStart = () => {
  return Math.floor(currentPage.value / pageNum) * pageNum
}
// 페이징
const paging = () => {
  //보여지는 페이지 리셋
  pageList.value = []

  //몇페이지 까지 있는지 확인
  if (cache.value.length % listCunt.value == 0) {
    totalPage.value = cache.value.length / listCunt.value - 1
  } else {
    totalPage.value = Math.ceil(cache.value.length / listCunt.value) - 1
  }

  //현재페이지 기준으로 페이징 숫자 넣기
  let pageListStart = currentPageListStart()
  for (let i = 0; i < pageNum; i++) {
    if (totalPage.value >= pageListStart) {
      pageList.value.push(pageListStart)
      pageListStart++
    }
  }
}

// 페이징
const categoryPaging = () => {
  //보여지는 페이지 리셋
  pageList.value = []

  //몇페이지 까지 있는지 확인
  if (cache.value.length % listCunt.value == 0) {
    totalPage.value = cache.value.length / listCunt.value - 1
  } else {
    totalPage.value = Math.ceil(list.value.length / listCunt.value) - 1
  }

  //현재페이지 기준으로 페이징 숫자 넣기
  let pageListStart = currentPageListStart()
  for (let i = 0; i < pageNum; i++) {
    if (totalPage.value >= pageListStart) {
      pageList.value.push(pageListStart)
      pageListStart++
    }
  }
}

const getList = async () => {
  try {
    const userId = await getUserId()
    const response = await axios.get(`http://${wikiAddress}/api/wiki/read/table/${props.tableId}/${userId}`, {
      headers: {
        Authorization: authToken,
      },
    })
    cache.value = response.data
    list2.value = response.data
    list.value = []
    firstDate.value = []

    const startIndex = listCunt.value * currentPage.value
    const endIndex = Math.min(startIndex + listCunt.value, cache.value.length)

    // 현재 페이지에 해당하는 게시글의 작성일을 가져오는 비동기 작업을 배열로 저장
    const fetchDates = []
    for (let i = startIndex; i < endIndex; i++) {
      const res2 = await axios.get(`http://${wikiAddress}/api/wikilog/readall/${cache.value[i].wikiId}/${userId}`, {
        headers: {
          Authorization: authToken,
        },
        withCredentials: true,
      })
      fetchDates.push(res2.data[0]?.date.substring(0, 10))
      // 해당 페이지에 있는 게시글을 list에 추가
      list.value.push(cache.value[i])
    }

    // 비동기 작업을 모두 완료한 후에 실행되는 새로운 Promise를 생성
    await Promise.all(fetchDates).then(dates => {
      firstDate.value = dates
    })

    // 페이지 및 버튼 업데이트
    paging()
    pageBtnCheck()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

getList()

//페이지 번호 클릭시
const page = e => {
  currentPage.value = e
  getList()
}

//리스트 갯수 수정시
watch(listCunt, (after, before) => {
  currentPage.value = 0
  getList()
})

const pageBtnCheck = () => {
  isBtnFirst.value = currentPage.value == 0 ? true : false
  isBtnPrev.value = currentPage.value == 0 ? true : false

  isBtnNext.value = currentPage.value == totalPage.value ? true : false
  isBtnLast.value = currentPage.value == totalPage.value ? true : false
}

watch(currentPage, (after, before) => {
  pageBtnCheck()
})

//페이지 처음/끝/이전/다음 버튼 클릭시
const pageArrow = e => {
  let movePage = parseInt(currentPage.value)
  if (e == 'first') {
    //처음으로
    movePage = 0
  } else if (e == 'last') {
    //마지막
    movePage = totalPage.value
  } else if (e == 'prev') {
    //이전
    movePage = currentPageListStart() - 1
    movePage < 0 ? (movePage = 0) : ''
  } else {
    //다음
    movePage = currentPageListStart() + 10
    movePage >= totalPage.value ? (movePage = totalPage.value) : ''
  }
  page(movePage)
}

function sendId(id) {
  router.push({ name: 'readwiki', params: { id } })
}

const selectedCategory = ref('')

// 선택된 카테고리에 따라 게시글을 필터링하는 함수
const filterByCategory = () => {
  console.log('Selected Category ID:', selectedCategory.value) // 선택된 카테고리 ID 로그 출력

  if (selectedCategory.value === '') {
    // 카테고리가 선택되지 않은 경우 모든 게시글을 보여줍니다.
    list.value = cache.value.slice(0, listCunt.value)
  } else {
    // 선택된 카테고리에 따라 게시글을 필터링합니다.
    list.value = cache.value.filter(item => item.category.id === selectedCategory.value).slice(0, listCunt.value)
  }

  // 필터링된 결과에 따라 총 페이지 수를 업데이트합니다.
  totalPage.value = Math.ceil(list.value.length / listCunt.value) - 1

  // 페이지 번호를 초기화합니다.
  currentPage.value = 0

  // 필터링된 결과가 현재 페이지 범위를 벗어날 경우, 현재 페이지를 조정합니다.
  if (currentPage.value > totalPage.value) {
    currentPage.value = totalPage.value
  }
  categoryPaging()
  pageBtnCheck()
}
</script>

<template>

      <VCard>
        <div style="margin-bottom: 20px"><VCardTitle color>Wiki List</VCardTitle></div>

        <select
          v-model="listCunt"
          style="margin-left: 10px"
        >
          <option
            value="5"
            selected
          >
            5개씩 보기
          </option>
          <option value="10">10개씩 보기</option>
          <option value="20">20개씩 보기</option></select
        >&nbsp;
        <select
          v-model="selectedCategory"
          @change="filterByCategory"
        >
          <option
            value=""
            selected
          >
            카테고리 선택
          </option>
          <option
            v-for="(item, idx) in list2"
            :key="idx"
            :value="item.category.id"
          >
            {{ item.category.name }}
          </option>
        </select>
        <br />
        <br />
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
            v-for="(item, idx) in list"
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

              <GetName :userId='item.userId'/>
                <!-- {{ item.user.username }} -->
              </td>
              <td
                width="20%"
                align="center"
              >
                {{ firstDate[idx] }}
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
              >
                < 이전
              </a>
            </li>
            <template
              v-for="(item, index) in pageList"
              :key="`list-${index}`"
            >
              <li
                class="page-item"
                :class="{ active: item == currentPage, bold: item == currentPage }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click.prevent="page(item)"
                  >{{ item + 1 }}</a
                >
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
              >
                다음 >
              </a>
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
