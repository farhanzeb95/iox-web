import { createRouter, createWebHistory } from 'vue-router'

import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import Dashboard from '../components/Dashboard.vue'
import Products from '../components/Products.vue'
import ProductDetails from '../components/shared/ProductDetails.vue'
import Watchlist from '../components/Watchlist.vue'
import Cart from '../components/Cart.vue'
import Checkout from '../components/Checkout.vue'
import OrderConfirmation from '../components/OrderConfirmation.vue'
import OrderDetail from '../components/OrderDetail.vue'
import Homepage from '../components/Homepage.vue'
import Profile from '../components/Profile.vue'
import Help from '../components/Help.vue'
import ShippingInfo from '../components/ShippingInfo.vue'
import ReturnsPolicy from '../components/ReturnsPolicy.vue'
import PaymentMethods from '../components/PaymentMethods.vue'
import SellerInfo from '../components/SellerInfo.vue'
import SellerStore from '../components/SellerStore.vue'
import { decodeToken } from '../utils/jwt'
import { UserTypes } from '../types/user_types'

const routes = [
  { path: '/', component: Homepage },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/profile', component: Profile },
  { path: '/products-view', component: Products },
  { path: '/product-details/:id', name: 'product-details', component: ProductDetails },
  { path: '/watchlist', component: Watchlist },
  { path: '/cart', component: Cart },
  { path: '/checkout', component: Checkout },
  { path: '/order-confirmation', component: OrderConfirmation },
  { path: '/orders/:id', name: 'order-detail', component: OrderDetail },
  { path: '/dashboard', component: Dashboard },
  { path: '/help', component: Help },
  { path: '/shipping', component: ShippingInfo },
  { path: '/returns-policy', component: ReturnsPolicy },
  { path: '/payment-methods', component: PaymentMethods },
  { path: '/seller-info', component: SellerInfo },
  { path: '/seller/:sellerId', name: 'seller-store', component: SellerStore },
  { path: '/returns', component: () => import('../components/Returns.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

const authRequiredPaths = ['/dashboard', '/profile', '/watchlist', '/cart', '/checkout', '/order-confirmation', '/orders', '/returns']
const buyerOnlyPaths = ['/watchlist', '/cart', '/checkout', '/order-confirmation']
const sellerAdminPaths = ['/dashboard', '/returns']

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('authToken')
  const decoded = token ? decodeToken(token) : null
  const userType = decoded?.type

  if (authRequiredPaths.some((p) => to.path === p || to.path.startsWith(p + '/'))) {
    if (!token || !userType) {
      next('/login')
      return
    }
  }

  if (buyerOnlyPaths.some((p) => to.path === p || to.path.startsWith(p + '/'))) {
    if (userType !== UserTypes.Buyer) {
      next('/products-view')
      return
    }
  }

  if (sellerAdminPaths.some((p) => to.path === p || to.path.startsWith(p + '/'))) {
    const allowed = userType === UserTypes.PrivateSeller || userType === UserTypes.BusinessSeller || userType === UserTypes.Admin
    if (!allowed) {
      next('/products-view')
      return
    }
  }

  next()
})

