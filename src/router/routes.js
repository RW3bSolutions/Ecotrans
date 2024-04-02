const routes = [
  {
    path: '/',
    component: () => import('pages/auth/Login.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/main',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/dashboard',
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: '/users',
        component: () => import('pages/Users.vue')
      },
      {
        path: '/vehicle-types',
        component: () => import('pages/VehicleTypes.vue')
      },
      {
        path: '/vehicles',
        component: () => import('pages/Vehicles.vue')
      },
      {
        path: '/clients',
        component: () => import('pages/Clients.vue')
      },
      {
        path: '/employees',
        component: () => import('pages/Employees.vue')
      },
      {
        path: '/employees/:id/attendances',
        component: () => import('pages/EmployeeAttendances.vue')
      },
      {
        path: '/payroll-periods',
        component: () => import('pages/PayrollPeriods.vue')
      },
      {
        path: '/payroll-periods/:id/dtr',
        component: () => import('pages/DailyTimeRecords.vue')
      },
      {
        path: '/attendances',
        component: () => import('pages/Attendances.vue')
      },
      {
        path: '/billing-statements',
        component: () => import('pages/BillingStatements.vue')
      }
    ],
    meta: {
      requiresAuth: true
    }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
