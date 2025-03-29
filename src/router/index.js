import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Privacy from '@/views/Privacy.vue'
import OrderSuccess from '@/views/OrderSuccess.vue'
import OrdersAdmin from '@/views/admin/Orders.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: 'Главная'
    }
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: () => import('../views/Catalog.vue'),
    meta: {
      title: 'Каталог услуг'
    }
  },
  {
    path: '/service/:id',
    name: 'ServiceDetails',
    component: () => import('../views/ServiceDetails.vue'),
    meta: {
      title: 'Детали услуги'
    }
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: () => import('../views/Calculator.vue'),
    meta: {
      title: 'Калькулятор стоимости'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      title: 'О нас'
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      requiresAuth: true,
      title: 'Личный кабинет'
    },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/AdminPanel.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Административная панель'
    },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue'),
    meta: {
      title: 'Корзина'
    }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: Privacy,
    meta: {
      title: 'Политика конфиденциальности'
    }
  },
  {
    path: '/order-success',
    name: 'OrderSuccess',
    component: OrderSuccess
  },
  {
    path: '/admin/orders',
    name: 'OrdersAdmin',
    component: OrdersAdmin,
    meta: {
      requiresAuth: true,
      title: 'Управление заказами'
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/AuthCallback.vue')
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: 'Страница не найдена'
    }
  },
  {
    // Перенаправление на 404 для всех несуществующих маршрутов
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return savedPosition || { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Установка заголовка страницы
  if (to.meta.title) {
    document.title = `${to.meta.title} | NKL Грузчики`
  } else {
    document.title = 'NKL Грузчики - грузоперевозки и услуги грузчиков в Минске'
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
