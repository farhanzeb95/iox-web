<script setup lang="ts">
  import { OnyxHeadline } from 'sit-onyx'
</script>

<template>
  <div class="static-page">
    <OnyxHeadline is="h1" class="page-title">Payment methods</OnyxHeadline>
    <section>
      <h2>Accepted payment options</h2>
      <p>IOX supports the following payment methods at checkout:</p>
      <ul>
        <li><strong>Cash on Delivery (COD)</strong> – Pay when your order is delivered.</li>
        <li><strong>Bank Transfer</strong> – Transfer the amount to the seller’s bank account using the details provided after order confirmation.</li>
        <li><strong>JazzCash</strong> – Pay via JazzCash mobile wallet.</li>
        <li><strong>EasyPaisa</strong> – Pay via EasyPaisa mobile wallet.</li>
        <li><strong>Credit/Debit Card</strong> – Pay using your card (subject to availability).</li>
      </ul>
    </section>
    <section>
      <h2>Security</h2>
      <p>We do not store your full card or wallet details. Payment details are handled in line with standard security practices.</p>
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
  section p,
  section ul {
    margin: 0 0 8px;
    color: var(--onyx-color-base-text-secondary);
    line-height: 1.6;
  }
  section ul {
    padding-left: 1.5rem;
  }
</style>
