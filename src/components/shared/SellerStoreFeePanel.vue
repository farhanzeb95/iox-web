<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { OnyxButton, OnyxInput, OnyxLoadingIndicator } from 'sit-onyx'
import { formatPricePKR } from '../../utils/format'
import {
  SELLER_FEE_PAYMENT_METHODS,
  type SellerFeePaymentMethod,
  type SellerStoreFee,
} from '../../types/seller_store_fee'
import { getMySellerStoreFee, submitSellerStoreFee } from '../../services/seller_store_fee_service'

const amount = ref(0)
const fee = ref<SellerStoreFee | null>(null)
const paymentMethod = ref<SellerFeePaymentMethod>('JAZZCASH')
const paymentReference = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const canSubmit = computed(() => fee.value?.status !== 'PAID' && !submitting.value)
const statusLabel = computed(() => {
  if (!fee.value) return 'Not submitted'
  if (fee.value.status === 'PAID') return 'Verified'
  if (fee.value.status === 'REJECTED') return 'Rejected - resubmission required'
  return 'Awaiting verification'
})

async function loadFee() {
  loading.value = true
  error.value = null
  try {
    const result = await getMySellerStoreFee()
    amount.value = result.amount
    fee.value = result.fee
    if (result.fee) {
      paymentMethod.value = result.fee.paymentMethod
      paymentReference.value = result.fee.paymentReference
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load store fee'
  } finally {
    loading.value = false
  }
}

async function submitFee() {
  if (!paymentReference.value.trim()) {
    error.value = 'Enter the transaction or bank reference number'
    return
  }
  submitting.value = true
  error.value = null
  success.value = null
  try {
    fee.value = await submitSellerStoreFee(paymentMethod.value, paymentReference.value.trim())
    success.value = 'Store fee submitted. An administrator will verify the payment.'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to submit store fee'
  } finally {
    submitting.value = false
  }
}

onMounted(loadFee)
</script>

<template>
  <section class="fee-panel" aria-labelledby="store-fee-title">
    <div class="fee-header">
      <div>
        <h2 id="store-fee-title">Store fee</h2>
        <p class="fee-copy">
          A monthly {{ formatPricePKR(amount) }} fee is required to keep your seller store active.
        </p>
      </div>
      <strong v-if="!loading" class="fee-status">{{ statusLabel }}</strong>
    </div>

    <OnyxLoadingIndicator v-if="loading" />
    <template v-else-if="fee?.status !== 'PAID'">
      <p class="fee-copy">Pay with JazzCash, EasyPaisa, Raast, or bank transfer, then enter the payment reference below.</p>
      <div class="payment-options" role="radiogroup" aria-label="Store fee payment method">
        <label v-for="option in SELLER_FEE_PAYMENT_METHODS" :key="option.value" class="payment-option">
          <input v-model="paymentMethod" type="radio" :value="option.value" name="seller-store-fee-payment" />
          <span>{{ option.label }}</span>
        </label>
      </div>
      <OnyxInput
        v-model="paymentReference"
        label="Transaction or bank reference"
        placeholder="Enter reference number"
        :disabled="submitting"
      />
      <p class="provider-note">Payment verification is currently completed manually by IOX.</p>
      <OnyxButton label="Submit store fee" :disabled="!canSubmit" @click="submitFee" />
    </template>

    <p v-if="success" class="success">{{ success }}</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="fee?.status === 'REJECTED' && fee.reviewNote" class="error">Review note: {{ fee.reviewNote }}</p>
  </section>
</template>

<style scoped>
.fee-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0 0 20px;
  padding: 20px;
  border: 1px solid var(--onyx-color-base-border-subtle);
  border-radius: 8px;
}

.fee-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

h2,
.fee-copy,
.provider-note,
.error,
.success {
  margin: 0;
}

.fee-copy,
.provider-note {
  color: var(--onyx-color-base-text-secondary);
  font-size: 0.9rem;
}

.fee-status {
  white-space: nowrap;
  color: var(--onyx-color-base-text-warning);
}

.payment-options {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.payment-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.error {
  color: var(--onyx-color-base-text-danger);
}

.success {
  color: var(--onyx-color-base-text-success);
}

@media (max-width: 600px) {
  .fee-panel {
    margin: 0 0 20px;
  }

  .fee-header {
    flex-direction: column;
  }
}
</style>
