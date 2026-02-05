<script setup lang="ts">
  import { OnyxHeadline } from 'sit-onyx'
</script>

<template>
  <div class="static-page">
    <OnyxHeadline is="h1" class="page-title">Returns & refunds</OnyxHeadline>
    <section>
      <h2>Return policy</h2>
      <p>If you are not satisfied with your purchase, you may be eligible for a return depending on the seller’s policy. Contact the seller through the order page or our support team to start a return request.</p>
    </section>
    <section>
      <h2>Refunds</h2>
      <p>Refunds are processed after the return is approved and the item is received by the seller. The refund will be issued using the same payment method you used for the order. Processing may take 5–10 business days.</p>
    </section>
    <section>
      <h2>Conditions</h2>
      <p>Items must typically be returned in original condition. Some products (e.g. perishables or personalized items) may not be eligible for return. Please check the product listing or contact the seller for specific terms.</p>
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
