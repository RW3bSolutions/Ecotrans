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
            EMPLOYEES
          </div>
        </div>
        <div class="col-8 col-md-4 q-py-sm q-pr-sm self-center">
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search" filled>
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-4 col-md-2 q-py-sm self-center text-right">
          <q-btn square icon="add" label="New" class="full-width" color="green" size="md" @click="create()" />
        </div>
      </div>

      <q-separator/>
      <div class="q-gutter-sm q-px-md q-pt-xs">
        <q-radio v-model="employee_type" color="dark" val="All" label="All" />
        <q-radio v-model="employee_type" color="dark" val="Staff" label="Staff" />
        <q-radio v-model="employee_type" color="dark" val="Driver" label="Driver" />
      </div>
      <div class="q-px-md q-pb-md q-pt-sm">
        <q-table
          square
          :dense="true"
          :rows="filterEmployeeType"
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
                  <q-item clickable v-close-popup class="q-pa-xs" :to="'/employees/' + props.value.id + '/attendances'">
                    <q-item-section class="bg-warning text-center text-white">
                      <q-item-label>DTR</q-item-label>
                    </q-item-section>
                  </q-item>
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
  </div>

  <q-dialog v-model="modal">
    <q-card style="width: 1000px; max-width: 90vw;">
      <form @submit.prevent="ifEdit ? update() : store()">
        <q-card-section>
          <div class="text-h6">{{ ifEdit ? 'UPDATE EMPLOYEE' : 'NEW EMPLOYEE' }}</div>
          <div class="text-caption text-red">
            Required *
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="q-pa-xs">
          <div class="row">
            <div class="col-12 col-md-4 q-pa-sm">
              <div class="q-pa-xs">
                <q-input filled color="dark" label="First Name *" square v-model="form.first_name" :dense="true" />
                <div class="text-caption text-red" v-if="errors.form.first_name && errors.show">
                  {{ errors.form.first_name[0] }}
                </div>
              </div>
              <div class="q-pa-xs">
                <q-input filled color="dark" label="Middle Name *" square v-model="form.middle_name" :dense="true" />
                <div class="text-caption text-red" v-if="errors.form.middle_name && errors.show">
                  {{ errors.form.middle_name[0] }}
                </div>
              </div>
              <div class="q-pa-xs">
                <q-input filled color="dark" label="Last Name *" square v-model="form.last_name" :dense="true" />
                <div class="text-caption text-red" v-if="errors.form.last_name && errors.show">
                  {{ errors.form.last_name[0] }}
                </div>
              </div>
            </div>
            <div class="col-12 col-md-4 q-pa-sm">
              <div class="q-pa-xs">
                <q-select filled color="dark" label="Employee Type *" square v-model="form.employee_type" :dense="true" :options="['Staff', 'Driver']" />
                <div class="text-caption text-red" v-if="errors.form.employee_type && errors.show">
                  {{ errors.form.employee_type[0] }}
                </div>
              </div>
              <div class="q-pa-xs">
                <q-input dense filled v-model="form.schedule_in" label="Schedule In *" mask="time">
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time
                          v-model="form.schedule_in"
                          format24h
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <div class="text-caption text-red" v-if="errors.form.schedule_in && errors.show">
                  {{ errors.form.schedule_in[0] }}
                </div>
              </div>
              <div class="q-pa-xs">
                <q-input dense filled v-model="form.schedule_out" label="Schedule Out *" mask="time">
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-time
                          v-model="form.schedule_out"
                          format24h
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <div class="text-caption text-red" v-if="errors.form.schedule_out && errors.show">
                  {{ errors.form.schedule_out[0] }}
                </div>
              </div>
            </div>
            <div class="col-12 col-md-4 q-pa-sm">
              <div class="q-pa-xs">
                <q-input filled color="dark" label="Position *" square v-model="form.position" :dense="true" />
                <div class="text-caption text-red" v-if="errors.form.position && errors.show">
                  {{ errors.form.position[0] }}
                </div>
              </div>
              <div class="q-pa-xs">
                <q-input type="date" filled color="dark" label="Date Hired *" square v-model="form.date_hired" :dense="true" />
                <div class="text-caption text-red" v-if="errors.form.date_hired && errors.show">
                  {{ errors.form.date_hired[0] }}
                </div>
              </div>
              <div class="q-pa-xs">
                <q-select filled color="dark" label="Employee Type *" square v-model="form.employment_type" :dense="true" :options="['Probationary', 'Regular', 'Resigned']" />
                <div class="text-caption text-red" v-if="errors.form.employment_type && errors.show">
                  {{ errors.form.employment_type[0] }}
                </div>
              </div>
              <div class="q-pa-xs" v-if="form.employment_type === 'Regular'">
                <q-input type="date" filled color="dark" label="Regular Employment Date" square v-model="form.regular_employment_date" :dense="true" />
                <div class="text-caption text-red" v-if="errors.form.regular_employment_date && errors.show">
                  {{ errors.form.regular_employment_date[0] }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="bg-white text-teal" v-if="!submitted">
          <q-btn square type="submit" class="full-width" :color="ifEdit ? 'primary' : 'green'" :label="ifEdit ? 'Update' : 'Save'"/>
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

</template>

<script>
import { defineComponent } from 'vue'
import { date } from 'quasar'

export default defineComponent({
  name: 'UsersPage',
  data () {
    return {
      employee_type: 'All',
      preload: true,
      rows: [],
      columns: [
        {
          name: 'employee_type',
          label: 'ACCOUNT TYPE',
          field: row => row.employee_type,
          align: 'left',
          sortable: true
        },
        {
          name: 'name',
          label: 'FULL NAME',
          field: row => row.last_name + ', ' + row.first_name + ', ' + row.middle_name,
          align: 'left',
          sortable: true
        },
        {
          name: 'position',
          label: 'POSITION',
          field: row => row.position,
          align: 'left',
          sortable: true
        },
        {
          name: 'schedule',
          label: 'SCHEDULE',
          field: row => row.schedule_in + ' - ' + row.schedule_out,
          align: 'left',
          sortable: true
        },
        {
          name: 'date_hired',
          label: 'DATE HIRED',
          field: row => row.date_hired,
          format: v => date.formatDate(v, 'MMM DD, YYYY'),
          align: 'left',
          sortable: true
        },
        {
          name: 'employment_type',
          label: 'EMPLOYMENT TYPE',
          field: row => row.employment_type,
          align: 'left',
          sortable: true
        },
        {
          name: 'regular_employment_date',
          label: 'REG. EMPLOYMENT DATE',
          field: row => row.regular_employment_date,
          format: v => v ? date.formatDate(v, 'MMM DD, YYYY') : '-',
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
      modal: false,
      object: false,
      ifEdit: false,
      ifView: false,
      form: {
        employee_type: null,
        first_name: null,
        middle_name: null,
        last_name: null,
        position: null,
        date_hired: null,
        employment_type: null,
        regular_employment_date: null,
        schedule_in: '08:00',
        schedule_out: '17:00'
      },
      errors: {
        show: false,
        form: {
          employee_type: null,
          first_name: null,
          middle_name: null,
          last_name: null,
          position: null,
          date_hired: null,
          employment_type: null,
          regular_employment_date: null,
          schedule_in: null,
          schedule_out: null
        }
      },
      submitted: false
    }
  },
  mounted () {
    this.index()
  },
  methods: {
    index () {
      this.$api.get('/system/employees', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.rows = response.data
          this.preload = false
        })
    },

    create () {
      this.modal = true
      this.ifEdit = false
      this.errors.show = false
      this.submitted = false
      this.form.is_active = 1
      this.form.employee_type = null
      this.form.first_name = null
      this.form.middle_name = null
      this.form.last_name = null
      this.form.position = null
      this.form.date_hired = null
      this.form.employment_type = null
      this.form.regular_employment_date = null
      this.form.schedule_in = '08:00'
      this.form.schedule_out = '17:00'
    },

    store () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/employees', {
        employee_type: this.form.employee_type,
        first_name: this.form.first_name,
        middle_name: this.form.middle_name,
        last_name: this.form.last_name,
        position: this.form.position,
        date_hired: this.form.date_hired,
        employment_type: this.form.employment_type,
        regular_employment_date: this.form.regular_employment_date,
        schedule_in: this.form.schedule_in,
        schedule_out: this.form.schedule_out
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.rows.push(response.data)
          this.submitted = false
          this.modal = false
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
    },

    edit (param) {
      this.modal = true
      this.ifEdit = true
      this.errors.show = false
      this.submitted = false
      this.object = param
      this.form.employee_type = param.employee_type
      this.form.first_name = param.first_name
      this.form.middle_name = param.middle_name
      this.form.last_name = param.last_name
      this.form.position = param.position
      this.form.date_hired = param.date_hired
      this.form.employment_type = param.employment_type
      this.form.regular_employment_date = param.regular_employment_date
      this.form.schedule_in = param.schedule_in
      this.form.schedule_out = param.schedule_out
    },

    update () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/employees/' + this.object.id, {
        employee_type: this.form.employee_type,
        first_name: this.form.first_name,
        middle_name: this.form.middle_name,
        last_name: this.form.last_name,
        position: this.form.position,
        date_hired: this.form.date_hired,
        employment_type: this.form.employment_type,
        regular_employment_date: this.form.regular_employment_date,
        schedule_in: this.form.schedule_in,
        schedule_out: this.form.schedule_out,
        _method: 'PUT'
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.object.is_active = this.form.is_active
          this.object.employee_type = this.form.employee_type
          this.object.first_name = this.form.first_name
          this.object.middle_name = this.form.middle_name
          this.object.last_name = this.form.last_name
          this.object.position = this.form.position
          this.object.date_hired = this.form.date_hired
          this.object.employment_type = this.form.employment_type
          this.object.regular_employment_date = this.form.regular_employment_date
          this.object.schedule_in = this.form.schedule_in
          this.object.schedule_out = this.form.schedule_out
          this.modal = false
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
    role () {
      return localStorage.getItem('role') ?? '-'
    },

    filterEmployeeType () {
      if (this.employee_type === 'All') {
        return this.rows
      }
      return this.rows.filter(v => v.employee_type === this.employee_type)
    }
  }
})
</script>
