<script setup lang="ts">
  import { OnyxHeadline } from 'sit-onyx'
</script>

<template>
  <div class="static-page">
    <OnyxHeadline is="h1" class="page-title">Shipping & delivery</OnyxHeadline>
    <section>
      <h2>Delivery times</h2>
      <p>Delivery times vary by seller and location. Sellers typically ship within 1–3 business days after order confirmation. You can track your order status (Pending → Confirmed → Shipped → Delivered) from your dashboard.</p>
    </section>
    <section>
      <h2>Shipping costs</h2>
      <p>Shipping costs may be included in the product price or calculated at checkout. Check the product page and checkout summary for details.</p>
    </section>
    <section>
      <h2>Tracking</h2>
      <p>When your order is shipped, the seller may provide tracking details. Check your order detail page for updates.</p>
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
    margin: 0;
    color: var(--onyx-color-base-text-secondary);
    line-height: 1.6;
  }
</style>
