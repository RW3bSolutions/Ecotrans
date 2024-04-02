<template>
  <div v-if="preload" class="fixed-center text-center">
    <q-spinner-facebook color="green" size="2.25em"/>
    <div class="q-pt-sm">Please wait...</div>
  </div>
  <q-layout view="lHh Lpr lFf" v-else>
    <q-header elevated>
      <q-toolbar class="bg-white">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          color="dark"
          @click="toggleLeftDrawer"
          v-if="$q.screen.lt.md"
        />

        <q-toolbar-title class="line-height-1">
          <img src="/logo.jpg" alt="" width="200px">
        </q-toolbar-title>

        <div>
          <q-btn icon="logout" color="dark" flat :label="$q.screen.lt.sm ? null : 'Logout'" @click="onLogout()" />
        </div>
      </q-toolbar>
      <q-toolbar v-if="!$q.screen.lt.md">
        <q-tabs
          indicator-color="transparent"
          inline-label
          align="justify"
          class="bg-primary text-white"
        >
          <q-route-tab v-for="(menu, index) in menus" :key="index" :label="menu.label" :to="menu.sub_menus.length === 0 ? menu.link : null">
            <q-menu anchor="bottom left" self="top left" v-if="menu.sub_menus.length">
              <q-item clickable v-for="(sub_menu, i) in menu.sub_menus" :key="i" :to="sub_menu.link" style="min-width: 200px;" v-close-popup>
                <q-item-section>{{ sub_menu.label }}</q-item-section>
              </q-item>
            </q-menu>
          </q-route-tab>
        </q-tabs>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      v-if="$q.screen.lt.md"
    >
      <q-list>
        <q-item-label
          header
          class="text-dark text-weight-bold"
        >
          MENU
        </q-item-label>

        <q-item clickable v-for="(menu, index) in menus" :key="index" :to="menu.sub_menus.length === 0 ? menu.link : null">
          <q-item-section>
            <q-item-label>{{ menu.label }}</q-item-label>
          </q-item-section>
          <q-menu anchor="bottom left" self="top left" v-if="menu.sub_menus.length">
            <q-item clickable v-for="(sub_menu, i) in menu.sub_menus" :key="i" :to="sub_menu.link" style="min-width: 300px;" v-close-popup>
              <q-item-section>{{ sub_menu.label }}</q-item-section>
            </q-item>
          </q-menu>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :key="$route.fullPath" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
  },

  data () {
    return {
      preload: true,
      menus: [
        {
          label: 'Dashboard',
          link: '/dashboard',
          sub_menus: []
        },
        {
          label: 'Clients',
          link: '/clients',
          sub_menus: [
          ]
        },
        {
          label: 'Employees',
          link: '/employees',
          sub_menus: []
        },
        {
          label: 'Payroll',
          link: '/payroll',
          sub_menus: [
            {
              label: 'Payroll Periods',
              link: '/payroll-periods'
            },
            {
              label: 'Attendances',
              link: '/attendances'
            }
          ]
        },
        {
          label: 'Billing Statements',
          link: '/billing-statements',
          sub_menus: []
        },
        {
          label: 'System Config',
          link: '/system-config',
          sub_menus: [
            {
              label: 'Users',
              link: '/users'
            },
            {
              label: 'Vehicle Types',
              link: '/vehicle-types'
            },
            {
              label: 'Vehicles',
              link: '/vehicles'
            }
          ]
        }
      ]
    }
  },

  setup () {
    const leftDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  },

  created () {
    this.getAuthUser()
  },

  methods: {
    getAuthUser () {
      this.$api.get('/user', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        if (response.data.portal !== 'System') {
          this.$q.notify({
            type: 'negative',
            message: '401 (Unauthorized)'
          })
          this.onLogout()
        }

        localStorage.setItem('name', response.data.name)
        localStorage.setItem('portal', response.data.portal)
        localStorage.setItem('role', response.data.role)
        this.preload = false
      })
    },

    onLogout () {
      this.$api.post('/auth/logout', {
      }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        localStorage.removeItem('token')
        this.$router.push('/')
      }).catch(error => {
        console.log(error)
      })
    }
  }
})
</script>
