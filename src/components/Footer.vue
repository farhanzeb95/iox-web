<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-columns">
        <div class="footer-col">
          <h3>Help</h3>
          <router-link to="/help">Help Center</router-link>
          <router-link to="/help#buy">How to buy</router-link>
        </div>
        <div class="footer-col">
          <h3>Shipping & delivery</h3>
          <router-link to="/shipping">Shipping info</router-link>
        </div>
        <div class="footer-col">
          <h3>Payment methods</h3>
          <router-link to="/payment-methods">Payment options</router-link>
        </div>
        <div class="footer-col">
          <h3>Returns & refunds</h3>
          <router-link to="/returns">Returns policy</router-link>
        </div>
        <div class="footer-col">
          <h3>Sell on IOX</h3>
          <router-link to="/seller-info">Seller information</router-link>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="powered-by">Powered by IOX</span>
        <span class="copyright">&copy; {{ new Date().getFullYear() }}. All rights reserved.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  min-height: var(--app-footer-height, 64px);
  display: flex;
  align-items: center;
  background: var(--onyx-color-base-background);
  background-color: var(--onyx-color-base-background);
  padding: 16px 24px;
  border-top: 1px solid var(--onyx-color-base-border-subtle);
  width: 100%;
  margin-top: auto;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 24px;
}

.footer-col h3 {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--onyx-color-base-text-secondary);
}

.footer-col a {
  display: block;
  font-size: 14px;
  color: var(--onyx-color-base-text);
  text-decoration: none;
  margin-bottom: 4px;
  transition: color 0.2s ease;
}

.footer-col a:hover {
  color: var(--onyx-color-base-primary);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--onyx-color-base-border-subtle);
}

.powered-by {
  font-size: 14px;
  font-weight: 600;
  color: var(--onyx-color-base-text);
}

.copyright {
  font-size: 14px;
  color: var(--onyx-color-base-text-secondary);
}

@media (max-width: 768px) {
  .footer-columns {
    grid-template-columns: repeat(2, 1fr);
  }
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>

<style>
/* Same solid background as profile dropdown so footer overlaps content */
[data-theme="light"] .footer {
  background: #fff;
  background-color: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .footer {
  background: #1c1c1e;
  background-color: #1c1c1e;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.6);
}
</style>
