# @ignorance/vue-hooks

> hooks for vue3.

# Installation

```sh
yarn add @ignorance/vue-hooks
```

# Quick look

## useValidator

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { useValidator } from '@ignorance/vue-hooks'

defineProps<{ msg: string }>()

const data = reactive({
  name: '',
  pwd: '',
})
const { result, validate, verify, verifyAll, resetRes } = useValidator(
  {
    name: [
      {
        validator: 'required',
        msg: '必填',
      },
    ],
    pwd: [
      {
        validator: 'required',
        msg: '必填',
      },
      {
        validator: 'min:3 max:6',
        msg: '长度在 2 ~ 6 之间',
      },
    ],
  },
  data
)
</script>

<template>
  <div>
    <span>名字</span>
    <input type="text" v-model="data.name" @input="validate('name')" />
    <br />
    <span v-if="!result.name.valid">{{ result.name.msg }}</span>
  </div>
  <div>
    <span>密码</span>
    <input type="text" v-model="data.pwd" @input="validate('pwd')" />
    <br />
    <span v-if="!result.pwd.valid">{{ result.pwd.msg }}</span>
  </div>
  <div>
    <button @click="verifyAll">提交</button>
  </div>
  <div>
    <button @click="resetRes('name')">重置名字校验</button>
  </div>
  <div>
    <button @click="resetRes">重置所有校验</button>
  </div>
</template>
```
