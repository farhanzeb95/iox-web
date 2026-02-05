import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import "sit-onyx/style.css";
import { createOnyx } from 'sit-onyx';

const onyx = createOnyx({
  router: router,
  // Theme configuration will be handled via CSS variables
});

// Theme will be initialized by the useTheme composable
// Just ensure data-theme attribute exists
if (!document.documentElement.getAttribute('data-theme')) {
  document.documentElement.setAttribute('data-theme', 'light')
}

// createApp(App).mount('#app')
createApp(App).use(router).use(onyx).mount('#app')
