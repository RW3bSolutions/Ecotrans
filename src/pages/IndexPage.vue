<template>
  <q-page class="q-pa-sm">
    <div class="row">
      <div class="col-12 col-md-12 col-lg-6 q-pa-sm">
        <q-markup-table dense separator="cell">
          <thead>
            <tr class="bg-grey-2">
              <th colspan="4">
                FOR REGULARIZATION
              </th>
            </tr>
            <tr>
              <th>EMPLOYEE NAME</th>
              <th>DATE HIRED</th>
              <th>NO. OF MONTHS</th>
              <th>EMPLOYEE TYPE</th>
            </tr>
          </thead>
          <tbody>
            <tr class="text-center" v-for="(regularization, index) in regularizations" :key="index">
              <td>{{ regularization.full_name }}</td>
              <td>{{ reformatDate(regularization.date_hired) }}</td>
              <td>{{ dateDiff(regularization.date_hired) }}</td>
              <td>{{ regularization.employee_type }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import { date } from 'quasar'

export default defineComponent({
  name: 'IndexPage',

  data () {
    return {
      preload: true,
      regularizations: []
    }
  },

  created () {
    this.index()
  },

  methods: {
    index () {
      this.$api.get('/system/dashboard', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.regularizations = response.data.regularizations
        })
    },

    reformatDate (param) {
      return date.formatDate(param, 'MMM DD, YYYY')
    },

    dateDiff (paramA) {
      const date1 = new Date()
      const date2 = new Date(paramA)
      const unit = 'months'
      const diff = date.getDateDiff(date1, date2, unit)
      return diff
    }

  }
})
</script>
