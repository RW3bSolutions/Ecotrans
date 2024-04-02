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
            VEHICLES
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
          <div class="text-h6">{{ ifEdit ? 'UPDATE VEHICLE' : 'NEW VEHICLE' }}</div>
          <div class="text-caption text-red">
            Required *
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div class="q-mb-sm">
            <q-select filled color="dark" label="Vehicle Type *" square v-model="form.vehicle_type_id" :dense="true" :options="vehicle_types" option-label="name" option-value="id" map-options emit-value />
            <div class="text-caption text-red" v-if="errors.form.vehicle_type_id && errors.show">
              {{ errors.form.vehicle_type_id[0] }}
            </div>
          </div>
          <div class="q-mb-sm">
            <q-input filled color="dark" label="Name *" square v-model="form.name" :dense="true">
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
          <div>
            <q-input filled color="dark" label="Plate No *" square v-model="form.plate_no" :dense="true" />
            <div class="text-caption text-red" v-if="errors.form.plate_no && errors.show">
              {{ errors.form.plate_no[0] }}
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
          name: 'vehicle_type',
          label: 'VEHICLE TYPE',
          field: row => row.vehicle_type.name,
          align: 'left',
          sortable: true
        },
        {
          name: 'name',
          label: 'NAME',
          field: row => row.name,
          align: 'left',
          sortable: true
        },
        {
          name: 'plate_no',
          label: 'PLATE NO.',
          field: row => row.plate_no,
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
        vehicle_type_id: null,
        name: null,
        plate_no: null,
        is_active: 1
      },
      errors: {
        show: false,
        form: {
          vehicle_type_id: null,
          name: null,
          plate_no: null,
          role: null
        }
      },
      submitted: false,
      vehicle_types: []
    }
  },
  mounted () {
    this.index()
  },
  methods: {
    index () {
      this.$api.get('/system/vehicles', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.rows = response.data
          this.preload = false
        })

      this.$api.get('/system/vehicle-types?active=1', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.vehicle_types = response.data
        })
    },

    create () {
      this.modal = true
      this.ifEdit = false
      this.errors.show = false
      this.submitted = false
      this.form.is_active = 1
      this.form.name = null
      this.form.plate_no = null
      this.form.vehicle_type_id = null
    },

    store () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/vehicles', {
        is_active: this.form.is_active,
        name: this.form.name,
        plate_no: this.form.plate_no,
        vehicle_type_id: this.form.vehicle_type_id
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.index()
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
      this.form.plate_no = param.plate_no
      this.form.vehicle_type_id = param.vehicle_type.id
    },

    update () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/vehicles/' + this.object.id, {
        name: this.form.name,
        plate_no: this.form.plate_no,
        vehicle_type_id: this.form.vehicle_type_id,
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
          this.object.plate_no = this.form.plate_no

          const find = this.vehicle_types.find(v => v.id === this.form.vehicle_type_id)
          this.object.vehicle_type = find

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
