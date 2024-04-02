<template>
  <div class="">
    <div class="fixed-center text-center" v-if="preload">
      <q-spinner-facebook
        color="primary"
        size="3em"
        :thickness="10"
      />
      <q-tooltip :offset="[0, 8]">Loading..</q-tooltip>
      <div class="q-mt-md">
        Please wait.
      </div>
    </div>

    <div v-else>
      <div class="row q-px-sm">
        <div class="col-12 col-md-6 q-py-sm self-center">
          <div class="text-weight-medium">
            <q-icon name="list_alt" size="md" class="q-mr-sm" />
            ATTENDANCES - {{ employee.full_name }}
          </div>
        </div>
        <div class="col-12 col-md-4 q-py-sm q-pr-sm self-center">
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search" filled>
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-2 q-py-sm self-center text-right">
          <q-select dense square filled label="Filter Payroll Period" v-model="from_to" :options="payroll_periods" option-label="from_to" option-value="id" map-options emit-value />
        </div>
      </div>

      <q-separator/>
      <div class="q-pa-md">
        <q-table
          square
          :dense="true"
          :rows="filterPayrollPeriod"
          :columns="columns"
          row-key="index"
          :filter="filter"
          v-model:pagination="pagination"
          separator="cell"
        >
          <template v-slot:body-cell-no="props">
            <q-td :props="props">
              <div>{{ props.rowIndex + 1 }}</div>
            </q-td>
          </template>
          <template v-slot:body-cell-action="props">
            <q-td :props="props">
              <q-btn-dropdown color="dark" label="Action" size="sm" square>
                <q-list class="q-pa-xs">
                  <q-item clickable v-close-popup class="q-pa-xs" @click="show(props.value)">
                    <q-item-section class="bg-warning text-center text-white">
                      <q-item-label class="text-weight-medium">DTR</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-td>
          </template>
        </q-table>
      </div>

    </div>
  </div>

  <q-dialog v-model="dtr.dialog" full-width="">
    <q-card>
      <q-card-section>
        <div class="text-h6">VIEW DTR</div>
        <div class="text-caption text-dark">
          {{ employee.full_name }} ({{ employee.schedule_in + '-' + employee.schedule_out }})
      </div>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <q-markup-table dense separator="cell">
          <thead>
            <tr v-if="dtr.attendance" class="text-left bg-grey-2">
              <th colspan="10">
                Working Days: {{ dtr.attendance.total_working_days }}
              </th>
            </tr>
            <tr class="text-center">
              <th>DATE</th>
              <th>TIME IN</th>
              <th>TIME OUT</th>
              <th>UNDERTIME</th>
              <th>LATE</th>
              <th>ABSENT</th>
              <th>SUNDAY</th>
              <th>SPEC.HOLIDAY</th>
              <th>REG.HOLIDAY</th>
              <th>NO WORK</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dtr_row, index) in dtr.rows" :key="index" class="text-center">
              <td class="text-center">{{ reformatDate(dtr_row.date) }}</td>
              <td>{{ dtr_row.time_in.substring(1) }}</td>
              <td>{{ dtr_row.time_out.substring(1) }}</td>
              <td>{{ dtr_row.undertime }}</td>
              <td>{{ dtr_row.late }}</td>
              <td>{{ dtr_row.absent }}</td>
              <td>{{ dtr_row.sunday }}</td>
              <td>{{ dtr_row.special_holiday }}</td>
              <td>{{ dtr_row.regular_holiday }}</td>
              <td>{{ dtr_row.no_work }}</td>
            </tr>
            <tr v-if="dtr.attendance">
              <td colspan="3" class="text-right bg-grey-2">TOTAL</td>
              <td class="text-center bg-yellow">{{ dtr.attendance.total_undertime }}</td>
              <td class="text-center bg-yellow">{{ dtr.attendance.total_late }}</td>
              <td class="text-center bg-yellow">{{ dtr.attendance.total_absent }}</td>
              <td class="text-center bg-yellow">{{ dtr.attendance.total_sunday }}</td>
              <td class="text-center bg-yellow">{{ dtr.attendance.total_special_holiday }}</td>
              <td class="text-center bg-yellow">{{ dtr.attendance.total_regular_holiday }}</td>
              <td class="text-center bg-yellow">{{ dtr.attendance.total_no_work }}</td>
            </tr>
          </tbody>

        </q-markup-table>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>
import { defineComponent } from 'vue'
import { date } from 'quasar'

export default defineComponent({
  name: 'UsersPage',
  data () {
    return {
      preload: true,
      rows: [],
      columns: [
        {
          name: 'from_to',
          label: 'DATE FROM-TO',
          field: row => row.payroll_period.from_to,
          align: 'left',
          sortable: true
        },
        {
          name: 'total_working_days',
          label: 'WORKING DAYS',
          field: row => row.total_working_days,
          align: 'left',
          sortable: true
        },
        {
          name: 'total_undertime',
          label: 'UNDERTIME',
          field: row => row.total_undertime,
          align: 'left',
          sortable: true
        },
        {
          name: 'total_late',
          label: 'LATE',
          field: row => row.total_late,
          align: 'left',
          sortable: true
        },
        {
          name: 'total_absent',
          label: 'ABSENT',
          field: row => row.total_absent,
          align: 'left',
          sortable: true
        },
        {
          name: 'total_sunday',
          label: 'SUNDAY',
          field: row => row.total_sunday,
          align: 'left',
          sortable: true
        },
        {
          name: 'total_special_holiday',
          label: 'SPEC.HOLIDAY',
          field: row => row.total_special_holiday,
          align: 'left',
          sortable: true
        },
        {
          name: 'total_regular_holiday',
          label: 'REG.HOLIDAY',
          field: row => row.total_regular_holiday,
          align: 'left',
          sortable: true
        },
        {
          name: 'total_no_work',
          label: 'NO WORK',
          field: row => row.total_no_work,
          align: 'left',
          sortable: true
        },
        {
          name: 'action',
          label: '-',
          field: row => row,
          align: 'center',
          style: 'width: 5%'
        }
      ],
      filter: null,
      pagination: {
        rowsPerPage: 15
      },
      employee: null,
      from_to: null,
      payroll_periods: [],
      dtr: {
        ifView: false,
        dialog: false,
        attendance: null,
        rows: []
      }
    }
  },
  mounted () {
    this.index()
  },
  methods: {
    index () {
      this.$api.get('/system/employees/' + this.$route.params.id, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.employee = response.data
          this.preload = false
        })

      this.$api.get('/system/attendances?employee_id=' + this.$route.params.id, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.rows = response.data
        })

      this.$api.get('/system/payroll-periods', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.payroll_periods = response.data
        })
    },

    reformatDate (param) {
      return date.formatDate(param, 'MMM DD, YYYY')
    },

    show (param) {
      this.employee = param.employee
      this.dtr.attendance = param
      this.dtr.rows = param.daily_time_records
      this.dtr.dialog = true
      this.dtr.ifView = true
    }
  },

  computed: {
    role () {
      return localStorage.getItem('role') ?? '-'
    },

    filterPayrollPeriod () {
      if (this.from_to) {
        return this.rows.filter(v => v.payroll_period_id === this.from_to)
      }
      return this.rows
    }
  }
})
</script>
