<template>
  <q-page class="q-pa-sm">
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
        <div class="col-12 col-md-12 q-py-sm self-center">
          <div class="text-weight-medium">
            <q-icon name="calendar_month" size="md" class="q-mr-sm" />
            DTR: <span class="bg-yellow q-pa-sm">{{ reformatDate(payroll_period.date_from) }} - {{ reformatDate(payroll_period.date_to) }} ({{ payroll_period.cutoff === 1 ? 'First Cut-off' : 'Second Cut-off' }})</span>
          </div>
        </div>
        <!-- <div class="col-12 col-md-2 q-py-sm self-center text-right">
          <q-btn square icon="add" label="NEW DTR" class="full-width" color="green" size="md" @click="create()" />
        </div> -->
      </div>

      <div class="q-pa-md">
        <q-table
          square
          :dense="true"
          :rows="rows"
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
          <template v-slot:body-cell-dtr="props">
            <q-td :props="props">
              <q-btn v-if="props.value.daily_time_records.length === 0" square label="ADD DTR" class="full-width" color="green" size="sm" @click="create(props.value)" />
              <q-btn v-else square label="VIEW DTR" class="full-width" color="primary" size="sm" @click="show(props.value)" />
            </q-td>
          </template>
          <template v-slot:body-cell-action="props">
            <q-td :props="props">
              <q-btn-dropdown color="dark" label="Action" size="sm" square>
                <q-list class="q-pa-xs">
                  <q-item clickable v-close-popup @click="edit(props.value)" class="q-pa-xs">
                    <q-item-section class="bg-primary text-center text-white">
                      <q-item-label class="text-weight-medium">EDIT</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <q-dialog v-model="dialog" full-width>
      <q-card>
        <form @submit.prevent="store()">
          <q-card-section>
            <div class="text-h6">NEW DTR</div>
            <div class="text-caption text-dark">
              {{ employee.full_name }} ({{ employee.schedule_in + '-' + employee.schedule_out }})
          </div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-markup-table dense separator="cell">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TIME IN</th>
                  <th>TIME OUT</th>
                  <!-- <th>BREAK</th> -->
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
                <tr v-for="(d, index) in dates" :key="index">
                  <td class="text-center">{{ reformatDate(d.date) }}</td>
                  <td>
                    <q-input dense filled v-model="d.time_in" mask="time" @update:model-value="d.late = computeLate(d.time_in, d.date)" :readonly="d.absent === 1 || d.no_work === 1" v-if="d.no_work === 0">
                      <template v-slot:append v-if="d.absent === 0">
                        <q-icon name="access_time" class="cursor-pointer">
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-time
                              v-model="d.time_in"
                              format24h
                              @update:model-value="d.late = computeLate(d.time_in, d.date)"
                            >
                              <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Close" color="primary" flat @click="d.late = computeLate(d.time_in, d.date)" />
                              </div>
                            </q-time>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </td>
                  <td>
                    <q-input dense filled v-model="d.time_out" mask="time" @update:model-value="d.undertime = computeUndertime(d.time_out, d.date)" :readonly="d.absent === 1 || d.no_work === 1" v-if="d.no_work === 0">
                      <template v-slot:append v-if="d.absent === 0">
                        <q-icon name="access_time" class="cursor-pointer">
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-time
                              v-model="d.time_out"
                              format24h
                              @update:model-value="d.undertime = computeUndertime(d.time_out, d.date)"
                            >
                              <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Close" color="primary" flat @click="d.undertime = computeUndertime(d.time_out, d.date)" />
                              </div>
                            </q-time>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </td>
                  <!-- <td>
                    <q-input dense square filled v-model="d.break" :readonly="d.absent === 1 || d.no_work === 1" v-if="d.no_work === 0" />
                  </td> -->
                  <td>
                    <q-input dense square filled v-model="d.undertime" :readonly="d.absent === 1 || d.no_work === 1" v-if="d.no_work === 0" />
                  </td>
                  <td>
                    <q-input dense square filled v-model="d.late" :readonly="d.absent === 1 || d.no_work === 1" v-if="d.no_work === 0" />
                  </td>
                  <td class="text-center">
                    <q-checkbox :true-value="1" :false-value="0" v-model="d.absent" v-if="d.no_work === 0" />
                  </td>
                  <td class="text-center">
                    <q-checkbox :true-value="1" :false-value="0" v-model="d.sunday" v-if="d.no_work === 0" />
                  </td>
                  <td class="text-center">
                    <q-checkbox :true-value="1" :false-value="0" v-model="d.special_holiday" v-if="d.no_work === 0" />
                  </td>
                  <td class="text-center">
                    <q-checkbox :true-value="1" :false-value="0" v-model="d.regular_holiday" v-if="d.no_work === 0" />
                  </td>
                  <td class="text-center">
                    <q-checkbox :true-value="1" :false-value="0" v-model="d.no_work" @update:model-value="d.time_in = employee.schedule_in, d.time_out = employee.schedule_out, d.break = 1, d.undertime = 0, d.late = 0, d.absent = 0, d.sunday = 0, d.special_holiday = 0, d.regular_holiday = 0" />
                  </td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right bg-grey-2">TOTAL</td>
                  <td class="text-center bg-yellow">{{ totalUndertime }}</td>
                  <td class="text-center bg-yellow">{{ totalLate }}</td>
                  <td class="text-center bg-yellow">{{ totalAbsent }}</td>
                  <td class="text-center bg-yellow">{{ totalSunday }}</td>
                  <td class="text-center bg-yellow">{{ totalSpecialHoliday }}</td>
                  <td class="text-center bg-yellow">{{ totalRegularHoliday }}</td>
                  <td class="text-center bg-yellow">{{ totalNoWork }}</td>
                </tr>
              </tbody>

            </q-markup-table>
          </q-card-section>
          <q-separator/>
          <q-card-section class="bg-white text-teal" v-if="!submitted">
            <q-btn square type="submit" class="full-width" color="green" label="Submit"/>
          </q-card-section>
          <q-card-section class="text-center" v-if="submitted">
            <q-spinner
              color="primary"
              size="md"
              :thickness="10"
            />
          </q-card-section>
          <q-separator/>
        </form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dtr.dialog" full-width="">
      <q-card>
        <form @submit.prevent="store()">
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
                  <!-- <th>BREAK</th> -->
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
                  <!-- <td>{{ dtr_row.break }}</td> -->
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
        </form>
      </q-card>
    </q-dialog>
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
      rows: [],
      columns: [
        {
          name: 'dtr',
          label: 'DTR',
          field: row => row,
          align: 'center',
          style: 'width: 7.5%',
          sortable: false
        },
        {
          name: 'full_name',
          label: 'FULL NAME',
          field: row => row.full_name,
          align: 'left',
          sortable: true
        },
        {
          name: 'total_working_days',
          label: 'WORKING DAYS',
          field: row => row.attendances.length ? row.attendances[0].total_working_days : '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'total_undertime',
          label: 'UNDERTIME',
          field: row => row.attendances.length ? row.attendances[0].total_undertime : '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'total_late',
          label: 'LATE',
          field: row => row.attendances.length ? row.attendances[0].total_late : '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'total_absent',
          label: 'ABSENT',
          field: row => row.attendances.length ? row.attendances[0].total_absent : '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'total_sunday',
          label: 'SUNDAY',
          field: row => row.attendances.length ? row.attendances[0].total_sunday : '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'total_special_holiday',
          label: 'SPEC.HOLIDAY',
          field: row => row.attendances.length ? row.attendances[0].total_special_holiday : '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'total_regular_holiday',
          label: 'REG.HOLIDAY',
          field: row => row.attendances.length ? row.attendances[0].total_regular_holiday : '-',
          align: 'left',
          sortable: true
        }
      ],
      filter: null,
      pagination: {
        rowsPerPage: 100
      },
      errors: {
        show: false,
        data: null
      },
      active_employees: [],
      employee: null,
      payroll_period: null,
      dates: null,
      submitted: false,
      dialog: false,
      dtr: {
        ifView: false,
        dialog: false,
        attendance: null,
        rows: []
      }
    }
  },

  created () {
    this.index()
  },

  methods: {
    reformatDate (param) {
      return date.formatDate(param, 'MMM DD, YYYY')
    },

    index () {
      this.$api.get('/system/payroll-periods/' + this.$route.params.id, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.rows = response.data.active_employees
          this.payroll_period = response.data.payroll_period
          this.dates = response.data.dates
          this.preload = false
        })
    },

    create (param) {
      this.employee = param
      if (param.employee_type === 'Staff') {
        this.dates.forEach(v => {
          v.time_in = param.schedule_in
          v.time_out = param.schedule_out
          v.break = 1
          v.undertime = 0
          v.late = 0
          v.absent = 0
          v.sunday = 0
          v.special_holiday = 0
          v.regular_holiday = 0
          v.no_work = date.formatDate(v.date, 'dddd') === 'Sunday' ? 1 : 0
        })
      }
      // if (param.employee_type === 'Driver') {
      // }
      this.dtr.ifView = false
      this.dialog = true
    },

    show (param) {
      this.employee = param
      this.dtr.attendance = param.attendances[0]
      this.dtr.rows = param.daily_time_records
      this.dtr.dialog = true
      this.dtr.ifView = true
    },

    computeLate (param, paramDate) {
      const time1 = new Date(paramDate + 'T' + this.employee.schedule_in + ':00')
      const time2 = new Date(paramDate + 'T' + param + ':00')
      const difference = time2 - time1
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      if (this.employee.schedule_in < param) {
        return parseFloat(hours + (minutes / 60)).toFixed(4)
      }
      return 0
    },

    computeUndertime (param, paramDate) {
      const time1 = new Date(paramDate + 'T' + this.employee.schedule_out + ':00')
      const time2 = new Date(paramDate + 'T' + param + ':00')
      const difference = time1 - time2
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      if (this.employee.schedule_out > param) {
        return parseFloat(hours + (minutes / 60)).toFixed(4)
      }
      return 0
    },

    store () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/daily-time-records', {
        payroll_period_id: this.$route.params.id,
        employee_id: this.employee.id,
        daily_time_records: this.dates,
        total_working_days: this.dates.length - this.totalNoWork,
        total_break: this.dates.length - this.totalAbsent,
        total_undertime: this.totalUndertime,
        total_late: this.totalLate,
        total_absent: this.totalAbsent,
        total_sunday: this.totalSunday,
        total_special_holiday: this.totalSpecialHoliday,
        total_regular_holiday: this.totalRegularHoliday,
        total_no_work: this.totalNoWork
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.rows = response.data
          this.submitted = false
          this.dialog = false
          this.$q.notify({
            progress: true,
            type: 'positive',
            message: 'Success',
            icon: 'check'
          })
        })
        .catch(error => {
          if (error.response.status === 422) {
            this.errors.form = error.response.data.errors
            this.errors.show = true
          }
          this.submitted = false
        })
    }
  },

  computed: {
    totalUndertime () {
      let total = 0
      this.dates.forEach(v => {
        if (!isNaN(v.undertime) && v.absent === 0) {
          total += Number(v.undertime)
        }
      })
      return total
    },
    totalLate () {
      let total = 0
      this.dates.forEach(v => {
        if (!isNaN(v.late) && v.absent === 0) {
          total += Number(v.late)
        }
      })
      return total
    },
    totalAbsent () {
      let total = 0
      this.dates.forEach(v => {
        if (!isNaN(v.absent)) {
          total += Number(v.absent)
        }
      })
      return total
    },
    totalNoWork () {
      let total = 0
      this.dates.forEach(v => {
        if (!isNaN(v.no_work)) {
          total += Number(v.no_work)
        }
      })
      return total
    },
    totalSunday () {
      let total = 0
      this.dates.forEach(v => {
        const time1 = new Date(v.date + 'T' + v.time_in + ':00')
        const time2 = new Date(v.date + 'T' + v.time_out + ':00')
        const difference = time2 - time1
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        if (!isNaN(v.sunday) && v.absent === 0) {
          if (v.sunday) {
            total += parseFloat((hours - v.break) + (minutes / 60))
          }
        }
      })
      return parseFloat(total).toFixed(4)
    },
    totalSpecialHoliday () {
      let total = 0
      this.dates.forEach(v => {
        const time1 = new Date(v.date + 'T' + v.time_in + ':00')
        const time2 = new Date(v.date + 'T' + v.time_out + ':00')
        const difference = time2 - time1
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        if (!isNaN(v.special_holiday) && v.absent === 0) {
          if (v.special_holiday) {
            total += parseFloat((hours - v.break) + (minutes / 60))
          }
        }
      })
      return parseFloat(total).toFixed(4)
    },
    totalRegularHoliday () {
      let total = 0
      this.dates.forEach(v => {
        const time1 = new Date(v.date + 'T' + v.time_in + ':00')
        const time2 = new Date(v.date + 'T' + v.time_out + ':00')
        const difference = time2 - time1
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        if (!isNaN(v.regular_holiday) && v.absent === 0) {
          if (v.regular_holiday) {
            total += parseFloat((hours - v.break) + (minutes / 60))
          }
        }
      })
      return parseFloat(total).toFixed(4)
    }
  }
})
</script>
