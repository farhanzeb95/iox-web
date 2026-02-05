<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { OnyxHeadline, OnyxButton } from 'sit-onyx'
  const router = useRouter()
</script>

<template>
  <div class="static-page">
    <OnyxHeadline is="h1" class="page-title">Sell on IOX</OnyxHeadline>
    <section>
      <h2>Join as a seller</h2>
      <p>List your products and reach buyers across the platform. You can register as a Private Seller or Business Seller from the signup page. Once approved, you can add products, set prices, and manage orders from your dashboard.</p>
    </section>
    <section>
      <h2>Get started</h2>
      <p>Create an account, choose your seller type, and start listing. You’ll get your own dashboard to manage products and orders, and you can mark orders as Ready to Ship, Shipped, or Delivered as you fulfill them.</p>
      <OnyxButton label="Sign up" class="cta-btn" @click="router.push('/signup')" />
    </section>
  </div>
</template>

<style scoped>
  .static-page {
    max-width: 700px;
    margin: 0 auto;
    padding: 24px 20px 100px;
  }
  .page-title {
    margin-bottom: 24px;
  }
  section {
    margin-bottom: 24px;
  }
  section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 8px;
  }
  section p {
    margin: 0 0 12px;
    color: var(--onyx-color-base-text-secondary);
    line-height: 1.6;
  }
  .cta-btn {
    margin-top: 8px;
  }
</style>
