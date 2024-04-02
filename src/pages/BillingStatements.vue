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
            BILLING STATEMENTS
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
                  <q-item clickable v-close-popup @click="show(props.value)" class="q-pa-xs">
                    <q-item-section class="bg-primary text-center text-white">
                      <q-item-label class="text-weight-medium">VIEW</q-item-label>
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

  <q-dialog v-model="modal" full-width>
    <q-card v-if="!ifShow">
      <form @submit.prevent="ifEdit ? update() : store()">
        <q-card-section>
          <div class="text-h6">{{ ifEdit ? 'UPDATE BILLING STATEMENT' : 'NEW BILLING STATEMENT' }}</div>
          <div class="text-caption text-red">
            Required *
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="row q-pa-xs">
          <div class="col-12 col-md-4 q-pa-xs">
            <div class="q-pa-xs">
              <q-input filled color="dark" label="Billing No. *" square v-model="form.bs_no" :dense="true" />
              <div class="text-caption text-red" v-if="errors.form.bs_no && errors.show">
                {{ errors.form.bs_no[0] }}
              </div>
            </div>
            <div class="q-pa-xs">
              <q-select filled color="dark" label="Client *" square v-model="form.client_id" :dense="true" :options="client.rows" option-label="company_name" option-value="id" map-options emit-value />
              <div class="text-caption text-red" v-if="errors.form.client_id && errors.show">
                {{ errors.form.client_id[0] }}
              </div>
            </div>
            <div class="q-pa-xs">
              <q-input type="date" filled color="dark" label="Date *" square v-model="form.date" :dense="true" />
              <div class="text-caption text-red" v-if="errors.form.date && errors.show">
                {{ errors.form.date[0] }}
              </div>
            </div>
            <div class="q-pa-xs">
              <q-input filled color="dark" label="TIN" square v-model="form.tin" :dense="true" />
              <div class="text-caption text-red" v-if="errors.form.tin && errors.show">
                {{ errors.form.tin[0] }}
              </div>
            </div>
            <div class="q-pa-xs">
              <q-input filled color="dark" label="Terms" square v-model="form.terms" :dense="true" />
              <div class="text-caption text-red" v-if="errors.form.terms && errors.show">
                {{ errors.form.terms[0] }}
              </div>
            </div>
            <div class="q-pa-xs">
              <q-input filled color="dark" label="Address" square v-model="form.address" :dense="true" />
              <div class="text-caption text-red" v-if="errors.form.address && errors.show">
                {{ errors.form.address[0] }}
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4 q-pa-xs">
            <div class="q-pa-xs">
              <q-input dense square filled label="QTY" type="number" v-model="form.qty" />
            </div>
            <div class="q-pa-xs">
              <q-input dense square filled label="ARTICLES" v-model="form.articles" />
            </div>
            <div class="q-pa-xs">
              <q-input dense square filled label="UNIT PRICE" type="number" v-model="form.unit_price" />
            </div>
            <div class="q-pa-xs">
              <q-btn label="Add" color="dark" @click="addItem()" :disable="!form.qty || !form.articles || !form.unit_price" />
            </div>
          </div>
          <div class="col-12 col-md-4 q-pa-xs">
            <div class="text-caption text-red" v-if="errors.form.items && errors.show">
              {{ errors.form.items[0] }}
            </div>
            <q-markup-table dense separator="cell" width="100%" class="text-center">
              <thead>
                <tr>
                  <th>QTY</th>
                  <th>ARTICLES</th>
                  <th>UNIT PRICE</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.items" :key="index">
                  <td>{{ item.qty }}</td>
                  <td>{{ item.articles }}</td>
                  <td>{{ item.unit_price }}</td>
                  <td>{{ item.unit_price * item.qty }}</td>
                </tr>

                <tr class="bg-grey-2">
                  <td colspan="3" class="text-right">VATABLE AMOUNT</td>
                  <td>{{ totalAmountDue / 1.12 }}</td>
                </tr>
                <tr class="bg-grey-2">
                  <td colspan="3" class="text-right">VAT AMOUNT</td>
                  <td>{{ totalAmountDue - (totalAmountDue / 1.12) }}</td>
                </tr>
                <tr class="bg-grey-2">
                  <td colspan="3" class="text-right">TOTAL AMOUTN DUE</td>
                  <td>{{ totalAmountDue }}</td>
                </tr>
              </tbody>
            </q-markup-table>
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
    <q-card v-else>
      <q-card-section class="bg-grey-2">
        <div class="text-h6">BILLING STATEMENT</div>
      </q-card-section>
      <q-card-section class="row">
        <div class="col-12 col-md-4 q-pa-sm">
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label>No.: {{ object.bs_no }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Billed To: {{ object.client.company_name }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Date: {{ object.date }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>TIN: {{ object.tin ?? '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Terms: {{ object.terms ?? '-' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label>Address: {{ object.address ?? '-' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="col-12 col-md-8 q-pa-sm">
          <q-markup-table dense separator="cell" width="100%" class="text-center">
            <thead>
              <tr>
                <th>QTY</th>
                <th>ARTICLES</th>
                <th>UNIT PRICE</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in JSON.parse(object.items)" :key="i">
                <td>{{ item.qty }}</td>
                <td>{{ item.articles }}</td>
                <td>{{ item.unit_price }}</td>
                <td>{{ item.unit_price * item.qty }}</td>
              </tr>

              <tr class="bg-grey-2">
                <td colspan="3" class="text-right">VATABLE AMOUNT</td>
                <td>{{ object.vatable_amount }}</td>
              </tr>
              <tr class="bg-grey-2">
                <td colspan="3" class="text-right">VAT AMOUNT</td>
                <td>{{ object.vat_amount }}</td>
              </tr>
              <tr class="bg-grey-2">
                <td colspan="3" class="text-right">TOTAL AMOUTN DUE</td>
                <td>{{ object.total_amount }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
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
          name: 'bs_no',
          label: 'NO.',
          field: row => row.bs_no,
          align: 'left',
          sortable: true
        },
        {
          name: 'date',
          label: 'DATE',
          field: row => row.date,
          format: v => date.formatDate(v, 'MMM DD, YYYY'),
          align: 'left',
          sortable: true
        },
        {
          name: 'company_name',
          label: 'CUSTOMER',
          field: row => row.client.company_name,
          align: 'left',
          sortable: true
        },
        {
          name: 'tin',
          label: 'TIN',
          field: row => row.tin ?? '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'terms',
          label: 'TERMS',
          field: row => row.terms ?? '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'address',
          label: 'ADDRESS',
          field: row => row.address ?? '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'vatable_amount',
          label: 'VATABLE AMOUNT',
          field: row => row.vatable_amount ?? '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'vat_amount',
          label: 'VAT AMOUNT',
          field: row => row.vat_amount ?? '-',
          align: 'left',
          sortable: true
        },
        {
          name: 'total_amount',
          label: 'TOTAL AMOUNT',
          field: row => row.total_amount ?? '-',
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
      ifShow: false,
      ifView: false,
      form: {
        bs_no: null,
        client_id: null,
        date: null,
        tin: null,
        terms: null,
        address: null,
        items: [],
        qty: null,
        articles: null,
        unit_price: null
      },
      errors: {
        show: false,
        form: {
          bs_no: null,
          client_id: null,
          date: null,
          tin: null,
          terms: null,
          address: null,
          items: null,
          vatable_amount: null,
          vat_amount: null,
          total_amount: null
        }
      },
      submitted: false,
      client: {
        preload: true,
        rows: []
      }
    }
  },
  mounted () {
    this.index()
  },
  methods: {
    index () {
      this.$api.get('/system/billing-statements', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.rows = response.data
          this.preload = false
        })

      this.$api.get('/system/clients', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.client.rows = response.data
          this.client.preload = false
        })
    },

    create () {
      this.modal = true
      this.ifEdit = false
      this.ifShow = false
      this.errors.show = false
      this.submitted = false
      this.form.bs_no = null
      this.form.client_id = null
      this.form.date = null
      this.form.tin = null
      this.form.terms = null
      this.form.address = null
      this.form.items = []
    },

    addItem () {
      this.form.items.push({
        qty: this.form.qty,
        articles: this.form.articles,
        unit_price: this.form.unit_price
      })

      this.form.qty = null
      this.form.articles = null
      this.form.unit_price = null
    },

    store () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/billing-statements', {
        bs_no: this.form.bs_no,
        client_id: this.form.client_id,
        date: this.form.date,
        tin: this.form.tin,
        terms: this.form.terms,
        address: this.form.address,
        items: this.form.items,
        vatable_amount: this.totalAmountDue / 1.12,
        vat_amount: this.totalAmountDue - (this.totalAmountDue / 1.12),
        total_amount: this.totalAmountDue
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

    show (param) {
      this.modal = true
      this.ifShow = true
      this.object = param
    },

    update () {
      this.submitted = true
      this.errors.show = false
      this.$api.post('system/billing-statements/' + this.object.id, {
        bs_no: this.form.bs_no,
        _method: 'PUT'
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      })
        .then(response => {
          this.object.is_active = this.form.is_active
          this.object.bs_no = this.form.bs_no
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
    totalAmountDue () {
      let total = 0
      this.form.items.forEach(v => {
        total += Number(v.qty * v.unit_price)
      })
      return total
    }
  }
})
</script>
