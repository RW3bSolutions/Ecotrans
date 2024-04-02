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
            CLIENTS
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
        <q-radio v-model="account_type" color="dark" val="All" label="All" />
        <q-radio v-model="account_type" color="dark" val="Corporate" label="Corporate Accounts" />
        <q-radio v-model="account_type" color="dark" val="Regular" label="Regular (Walk-In)" />
      </div>
      <div class="q-px-md q-pb-md q-pt-sm">
        <q-table
          square
          :dense="true"
          :rows="filterAccountType"
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
                  <q-item clickable v-close-popup class="q-pa-xs">
                    <q-item-section class="bg-green text-center text-white">
                      <q-item-label class="text-weight-medium">VIEW</q-item-label>
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
          <div class="text-h6">{{ ifEdit ? 'UPDATE CLIENT' : 'NEW CLIENT' }}</div>
          <div class="text-caption text-red">
            Required *
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div class="q-mb-sm">
            <q-select filled color="dark" label="Account Type *" square v-model="form.account_type" :dense="true" :options="['Corporate', 'Regular']" />
            <div class="text-caption text-red" v-if="errors.form.account_type && errors.show">
              {{ errors.form.account_type[0] }}
            </div>
          </div>
          <div class="q-mb-sm">
            <q-input filled color="dark" label="Company Name *" square v-model="form.company_name" :dense="true" />
            <div class="text-caption text-red" v-if="errors.form.company_name && errors.show">
              {{ errors.form.company_name[0] }}
            </div>
          </div>
          <div class="q-mb-sm">
            <q-input filled color="dark" label="Contact Person *" square v-model="form.contact_person" :dense="true" />
            <div class="text-caption text-red" v-if="errors.form.contact_person && errors.show">
              {{ errors.form.contact_person[0] }}
            </div>
          </div>
          <div>
            <q-input filled color="dark" label="Contact No. *" square v-model="form.contact_no" :dense="true" />
            <div class="text-caption text-red" v-if="errors.form.contact_no && errors.show">
              {{ errors.form.contact_no[0] }}
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
      account_type: 'All',
      preload: true,
      rows: [],
      columns: [
        {
          name: 'account_type',
          label: 'ACCOUNT TYPE',
          field: row => row.account_type,
          align: 'left',
          sortable: true
        },
        {
          name: 'company_name',
          label: 'COMPANY NAME',
          field: row => row.company_name,
          align: 'left',
          sortable: true
        },
        {
          name: 'contact_person',
          label: 'CONTACT PERSON',
          field: row => row.contact_person,
          align: 'left',
          sortable: true
        },
        {
          name: 'contact_no',
          label: 'CONTACT NO.',
          field: row => row.contact_no,
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
        account_type: null,
        company_name: null,
        contact_person: null,
        contact_no: null
      },
      errors: {
        show: false,
        form: {
          account_type: null,
          company_name: null,
          contact_person: null,
          contact_no: null
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
      this.$api.get('/system/clients', {
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
      this.form.account_type = null
      this.form.company_name = null
      this.form.contact_person = null
      this.form.contact_no = null
    },

    store () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/clients', {
        account_type: this.form.account_type,
        company_name: this.form.company_name,
        contact_person: this.form.contact_person,
        contact_no: this.form.contact_no
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
      this.form.account_type = param.account_type
      this.form.company_name = param.company_name
      this.form.contact_person = param.contact_person
      this.form.contact_no = param.contact_no
    },

    update () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/clients/' + this.object.id, {
        account_type: this.form.account_type,
        company_name: this.form.company_name,
        contact_person: this.form.contact_person,
        contact_no: this.form.contact_no,
        _method: 'PUT'
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.object.is_active = this.form.is_active
          this.object.account_type = this.form.account_type
          this.object.company_name = this.form.company_name
          this.object.contact_person = this.form.contact_person
          this.object.contact_no = this.form.contact_no
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

    filterAccountType () {
      if (this.account_type === 'All') {
        return this.rows
      }
      return this.rows.filter(v => v.account_type === this.account_type)
    }
  }
})
</script>
