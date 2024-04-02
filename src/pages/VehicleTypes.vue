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
            VEHICLE TYPES
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
          <div class="text-h6">{{ ifEdit ? 'UPDATE VEHICLE TYPE' : 'NEW VEHICLE TYPE' }}</div>
          <div class="text-caption text-red">
            Required *
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div>
            <q-input filled color="dark" label="Name *" square v-model="form.name" :dense="true" autofocus>
              <template v-slot:after v-if="ifEdit">
                <q-toggle
                  size="sm"
                  class="text-caption text-weight-medium"
                  color="green"
                  label="Active"
                  v-model="form.is_active"
                  :true-value="1"
                  :false-value="0"
                />
              </template>
            </q-input>
            <div class="text-caption text-red" v-if="errors.form.name && errors.show">
              {{ errors.form.name[0] }}
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

export default defineComponent({
  name: 'UsersPage',
  data () {
    return {
      preload: true,
      rows: [],
      columns: [
        {
          name: 'name',
          label: 'NAME',
          field: row => row.name,
          align: 'left',
          sortable: true
        },
        {
          name: 'is_active',
          label: 'ACTIVE',
          field: row => row.is_active,
          align: 'center',
          style: 'width: 5%'
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
        name: null,
        is_active: 1
      },
      errors: {
        show: false,
        form: {
          name: null,
          role: null
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
      this.$api.get('/system/vehicle-types', {
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
      this.form.name = null
    },

    store () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/vehicle-types', {
        is_active: this.form.is_active,
        name: this.form.name
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
      this.form.is_active = param.is_active
      this.form.name = param.name
    },

    update () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/vehicle-types/' + this.object.id, {
        name: this.form.name,
        is_active: this.form.is_active,
        _method: 'PUT'
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.object.is_active = this.form.is_active
          this.object.name = this.form.name
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
