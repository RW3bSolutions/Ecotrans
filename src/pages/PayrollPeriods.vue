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
            PAYROLL PERIODS
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
          <template v-slot:body-cell-action="props">
            <q-td :props="props">
              <q-btn-dropdown color="dark" label="Action" size="sm" square>
                <q-list class="q-pa-xs">
                  <q-item clickable v-close-popup class="q-pa-xs" :to="'/payroll-periods/' + props.value.id + '/dtr'">
                    <q-item-section class="bg-warning text-center text-white">
                      <q-item-label class="text-weight-medium">DTR</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup class="q-pa-xs">
                    <q-item-section class="bg-dark text-center text-white">
                      <q-item-label class="text-weight-medium">PAYROLL</q-item-label>
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
    <q-card style="width: 700px; max-width: 80vw;">
      <form @submit.prevent="ifEdit ? update() : store()">
        <q-card-section>
          <div class="text-h6">{{ ifEdit ? 'UPDATE PAYROLL PERIOD' : 'NEW PAYROLL PERIOD' }}</div>
          <div class="text-caption text-red">
            Required *
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div class="q-mb-sm">
            <div class="q-gutter-sm">
              <q-radio v-model="form.cutoff" :val="1" label="First Cut-off" />
              <q-radio v-model="form.cutoff" :val="2" label="Second Cut-off" />
            </div>
          </div>
          <div class="q-mb-sm">
            <q-input filled color="dark" label="Date From *" square v-model="form.date_from" :dense="true" type="date" />
            <div class="text-caption text-red" v-if="errors.form.date_from && errors.show">
              {{ errors.form.date_from[0] }}
            </div>
          </div>
          <div>
            <q-input filled color="dark" label="Date To *" square v-model="form.date_to" :dense="true" type="date" />
            <div class="text-caption text-red" v-if="errors.form.date_to && errors.show">
              {{ errors.form.date_to[0] }}
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
      preload: true,
      rows: [],
      columns: [
        {
          name: 'cutoff',
          label: 'CUT-OFF',
          field: row => row.cutoff,
          align: 'left',
          sortable: true
        },
        {
          name: 'date_from',
          label: 'DATE FROM',
          field: row => row.date_from,
          format: v => date.formatDate(v, 'MMM DD, YYYY'),
          align: 'left',
          sortable: true
        },
        {
          name: 'date_to',
          label: 'DATE TO',
          field: row => row.date_to,
          format: v => date.formatDate(v, 'MMM DD, YYYY'),
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
        cutoff: 1,
        date_from: null,
        date_to: null
      },
      errors: {
        show: false,
        form: {
          cutoff: 1,
          date_from: null,
          date_to: null
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
      this.$api.get('/system/payroll-periods', {
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
      this.form.cutoff = 1
      this.form.date_from = null
      this.form.date_to = null
    },

    store () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/payroll-periods', {
        cutoff: this.form.cutoff,
        date_from: this.form.date_from,
        date_to: this.form.date_to
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
          // this.$router.push('/payroll-periods/' + response.data.id)
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
      this.form.cutoff = param.cutoff
      this.form.date_from = param.date_from
      this.form.date_to = param.date_to
    },

    update () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/payroll-periods/' + this.object.id, {
        cutoff: this.form.cutoff,
        date_from: this.form.date_from,
        date_to: this.form.date_to,
        _method: 'PUT'
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.object.cutoff = this.form.cutoff
          this.object.date_from = this.form.date_from
          this.object.date_to = this.form.date_to
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
    }
  }
})
</script>
