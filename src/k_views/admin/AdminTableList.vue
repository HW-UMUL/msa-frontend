<script setup>
import { useRouter } from 'vue-router'

// 년-월-일
const formatDate = function(value) {
    const date = new Date(value);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1);
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    
    return `${year}-${month}-${day} ${hour}:${min}`;
}

const serverAddress = inject('serverAddress')
const tableAddress = inject('tableAddress')
const postAddress = inject('postAddress')
const wikiAddress = inject('wikiAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

// 정렬
const sortDirection = ref('desc')
const sortBy = ref('id')

function togglesort(sortType) {
  if (sortBy.value === sortType) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = sortType
    sortDirection.value = 'asc'
  }
  issort();
}

function issort() {
  sortBy.value === 'id'
  sortBy.value === 'name'
  sortBy.value === 'date'

  const checkedTableIds = checkedTables.value.map((checked, index) => checked ? sortedTables.value[index].id : null);
  sortedTables.value.sort((a, b) => {
    const compareResult = sortDirection.value === 'asc' ? -1 : 1
    switch (sortBy.value) {
      case 'id':
        return compareResult * (a.id - b.id);
      case 'name':
        return compareResult * (a.name.localeCompare(b.name))
      case 'date':
        return compareResult * (new Date(a.date) - new Date(b.date))
      default:
        return 0;
    }
  })
  checkedTables.value = sortedTables.value.map(table => checkedTableIds.includes(table.id));
}

const sortedTables = ref([])
const tables = ref([])

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

async function getTables(){
  const userId = await getUserId()
  const response = await fetch(
      `http://${tableAddress}/api/table/read/tables/${userId}`,
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
    console.error(error)
  } else{
    const tablesData = await response.json();
    tables.value = tablesData.filter(table => table.name != "main")
  }
  sortedTables.value = [...tables.value];
  issort()
}

getTables()

// 삭제
async function delTable(tableId) {
  const response = await fetch(
    `http://${tableAddress}/api/table/delete/${tableId}/${userId}`,
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
    console.error()
  }
}

const checkedTables = ref([]);
async function delcheckedtables() {
  const delTableList = [];

  checkedTables.value.forEach((checked, index) => {
    if (checked) {
      delTableList.push(sortedTables.value[index].id);
    }
  })
  if(delTableList.every(value => !value)) {
      alert("삭제할 테이블을 선택하십시오.");
      return;
    }
  if(delTableList.includes(1)) {
    alert("삭제할 수 없는 테이블 입니다.");
    return;
  }
  const confirmdel = confirm("삭제하시겠습니까?");
  if(!confirmdel) return;

  try {
    for(const tableId of delTableList) {
    await delTable(tableId);
  }
  checkedTables.value = [];
  alert("삭제되었습니다.");
  } catch(error) {
    console.error(error);
    alert("삭제할 수 없습니다.");
  }
  getTables()
}

const allChecked = ref(false);

function selectAllCheckboxes() {
  checkedTables.value = sortedTables.value.map(() => allChecked.value);
}

function selectIndividualCheckbox(index) {
  checkedTables.value[index] = !checkedTables.value[index];
  allChecked.value = checkedTables.value.every(checked => checked);
}

// 이동
const router = useRouter()
function gotoTable(tableId){
  router.push({
    path: `/mytables/${tableId}`
  })
}
</script>

<template>
<div style="margin: 10px;
  display: flex;
  justify-content: space-between">
  <span
    style="font-size: small;
    margin-left: 10px;">
    total : {{ tables.length }}
  </span>
  <VIconBtn
    style="margin-right: 10px;
    cursor: pointer"
    @click="delcheckedtables"
    >
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
        Name
        <VIcon size="12pt"
        :icon="sortBy === 'name' ? (sortDirection === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line') : 'ri-subtract-line'"
          @click="togglesort('name')" />
      </th>
      <th class="text-center">
        Description
      </th>
      <th class="text-center">
        date
        <VIcon size="12pt"
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
    <tr v-for="(item, index) in sortedTables" :key="index">
      <td class="text-center" style="width: 60pt">
        {{ item.id }}
      </td>
      <td class="text-center">
        <VIconBtn 
          class="text-center"
          style="cursor: pointer; color: #8C57FF;"
          @click="gotoTable(item.id)">
          {{ item.name }}
        </VIconBtn>
      </td>
      <td class="text-center">
        {{ item.description }}
      </td>
      <td class="text-center">
        {{ formatDate(item.date) }}
      </td>
      <td class="text-center" style="width: 50px;">
        <input 
          type="checkbox"
          :checked="checkedTables[index]"
          @change.stop="selectIndividualCheckbox(index)"
          >
      </td>
    </tr>
  </tbody>
</VTable>
</template>