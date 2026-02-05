<script setup lang="ts">
  import { OnyxHeadline } from 'sit-onyx'
</script>

<template>
  <div class="static-page">
    <OnyxHeadline is="h1" class="page-title">Help Center</OnyxHeadline>
    <section>
      <h2>How can we help?</h2>
      <p>Find answers to common questions about shopping and selling on IOX.</p>
    </section>
    <section id="buy">
      <h2>How to buy</h2>
      <p>Browse products by category or search, add items to your cart, and proceed to checkout. You can choose your shipping address and payment method (COD, Bank Transfer, JazzCash, EasyPaisa, or Card). After placing an order, you can track its status from your dashboard.</p>
    </section>
    <section>
      <h2>Contact</h2>
      <p>For further assistance, please contact our support team. We aim to respond within 24–48 hours.</p>
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
