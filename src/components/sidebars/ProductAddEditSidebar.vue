<script setup lang="ts">
  import { ref, computed, watch, onUnmounted } from 'vue'
  import { OnyxButton, OnyxInput, OnyxSidebar, OnyxIconButton, OnyxTextarea, OnyxSelect, OnyxStepper, OnyxSwitch, OnyxFormElement } from 'sit-onyx'
  import { iconX } from '@sit-onyx/icons'
  import type { Product } from '../../types/product'
  import { uploadProductImages, createProduct, updateProduct } from '../../services/products_service'
  
  const props = defineProps<{
    isOpen: boolean
    mode: 'add' | 'edit'
    product?: Product | null
  }>()
  
  const emit = defineEmits<{
    (e: 'close'): void
    (e: 'save', product: Product): void
  }>()
  
  const localIsOpen = ref(props.isOpen)
  
  // Sync local state with prop
  watch(() => props.isOpen, (newVal) => {
    localIsOpen.value = newVal
  })
  
  watch(localIsOpen, (newVal) => {
    if (!newVal) {
      emit('close')
    }
  })
  
  // Form fields based on Product model
  const title = ref('')
  const description = ref('')
  const price = ref<number | null>(null)
  const quantity = ref<number>(1)
  const isAvailable = ref(true)
  const category = ref('')
  const sku = ref('')
  const condition = ref<'new' | 'used' | 'refurbished' | ''>('')
  const conditionOptions = [
    { value: '' as const, label: 'Select condition' },
    { value: 'new' as const, label: 'New' },
    { value: 'used' as const, label: 'Used' },
    { value: 'refurbished' as const, label: 'Refurbished' },
  ]
  // OnyxStepper expects number; sync with price (number | null)
  const priceStepper = computed({
    get: () => price.value ?? 0,
    set: (v: number) => { price.value = v },
  })
  const tags = ref<string>('') // Comma-separated string, will be converted to array
  const selectedFiles = ref<File[]>([])
  const previews = ref<string[]>([])
  const uploadedImageUrls = ref<string[]>([])
  const maxFiles = 5
  
  // Loading state
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  
  // Persist product id for submit (API returns "id"; backend may also use "_id" or $oid)
  const editingProductId = ref<string | null>(null)
  const getProductId = (p: Product | null | undefined): string | null => {
    if (!p) return null
    const raw = (p as any).id ?? (p as any)._id
    if (typeof raw === 'string' && raw.length > 0) return raw
    if (typeof raw === 'number') return String(raw)
    if (raw && typeof raw === 'object' && typeof (raw as any).$oid === 'string') return (raw as any).$oid
    return null
  }
  
  // Keep editingProductId in sync when opening in edit mode (so submit always has id)
  watch(
    () => [props.isOpen, props.product, props.mode] as const,
    ([isOpen, product, mode]) => {
      if (isOpen && product && mode === 'edit') {
        const id = getProductId(product)
        console.log('[ProductAddEditSidebar] sync edit id on open', { isOpen, mode, productId: id, productIdRaw: product ? (product as any).id ?? (product as any)._id : null })
        if (id) editingProductId.value = id
      }
    }
  )

  // Initialize form from product prop
  watch(() => props.product, (product) => {
    if (product) {
      const id = getProductId(product)
      editingProductId.value = id
      console.log('[ProductAddEditSidebar] product watcher (edit form)', { productId: id, rawId: (product as any).id, raw_id: (product as any)._id })
      title.value = product.title || product.name || ''
      description.value = product.description || ''
      price.value = product.price || null
      quantity.value = product.quantity || 1
      isAvailable.value = product.isAvailable ?? true
      category.value = product.category || ''
      sku.value = product.sku || ''
      condition.value = (product.condition as 'new' | 'used' | 'refurbished') || ''
      tags.value = product.tags?.join(', ') || ''
      uploadedImageUrls.value = product.images || []
      previews.value = product.images || []
    } else {
      editingProductId.value = null
      // Reset form
      title.value = ''
      description.value = ''
      price.value = null
      quantity.value = 1
      isAvailable.value = true
      category.value = ''
      sku.value = ''
      condition.value = ''
      tags.value = ''
      selectedFiles.value = []
      previews.value = []
      uploadedImageUrls.value = []
    }
    errorMessage.value = ''
  }, { immediate: true })
  
  // Handle file selection
  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
      const newFiles = Array.from(target.files)
      selectedFiles.value = [...selectedFiles.value, ...newFiles].slice(0, maxFiles)
      target.value = '' // Reset input
    }
  }
  
  // Generate preview URLs for new files
  watch(selectedFiles, (files, oldFiles) => {
    if (oldFiles) {
      oldFiles.forEach((_, index) => {
        const oldUrl = previews.value[uploadedImageUrls.value.length + index]
        if (oldUrl && oldUrl.startsWith('blob:')) {
          URL.revokeObjectURL(oldUrl)
        }
      })
    }
    
    // Keep existing uploaded URLs, add new blob URLs
    const newPreviews = files.map(file => URL.createObjectURL(file))
    previews.value = [...uploadedImageUrls.value, ...newPreviews]
  })
  
  // Remove a file by index
  const removeFile = (index: number) => {
    if (index < uploadedImageUrls.value.length) {
      // Remove uploaded image
      uploadedImageUrls.value = uploadedImageUrls.value.filter((_, i) => i !== index)
      previews.value = previews.value.filter((_, i) => i !== index)
    } else {
      // Remove new file
      const fileIndex = index - uploadedImageUrls.value.length
      const oldUrl = previews.value[index]
      if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl)
      }
      selectedFiles.value = selectedFiles.value.filter((_, i) => i !== fileIndex)
      previews.value = previews.value.filter((_, i) => i !== index)
    }
  }
  
  // Validate form
  const validateForm = (): boolean => {
    if (!title.value.trim()) {
      errorMessage.value = 'Product title is required'
      return false
    }
    if (!description.value.trim()) {
      errorMessage.value = 'Product description is required'
      return false
    }
    if (!price.value || price.value <= 0) {
      errorMessage.value = 'Valid price is required'
      return false
    }
    if (quantity.value < 0) {
      errorMessage.value = 'Quantity must be 0 or greater'
      return false
    }
    if (uploadedImageUrls.value.length === 0 && selectedFiles.value.length === 0) {
      errorMessage.value = 'At least one product image is required'
      return false
    }
    return true
  }
  
  // Submit form
  const submit = async () => {
    if (!validateForm()) return
    
    isSubmitting.value = true
    errorMessage.value = ''
    
    try {
      let imageUrls = [...uploadedImageUrls.value]
      
      // Upload new files if any
      if (selectedFiles.value.length > 0) {
        const uploadedUrls = await uploadProductImages(selectedFiles.value)
        imageUrls = [...imageUrls, ...uploadedUrls]
      }
      
      // Convert tags string to array
      const tagsArray = tags.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
      
      // Create product object
      const productData: Partial<Product> = {
        title: title.value,
        name: title.value, // Alias for compatibility
        description: description.value,
        price: price.value!,
        quantity: quantity.value,
        isAvailable: isAvailable.value,
        images: imageUrls,
        category: category.value || undefined,
        sku: sku.value || undefined,
        condition: condition.value || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      }
      
      const productId = editingProductId.value ?? getProductId(props.product)
      // DEBUG: edit flow
      console.log('[ProductAddEditSidebar] submit', {
        mode: props.mode,
        editingProductId: editingProductId.value,
        getProductIdFromProp: getProductId(props.product),
        productId,
        productKeys: props.product ? Object.keys(props.product) : null,
      })
      if (props.mode === 'edit') {
        if (!productId) {
          console.warn('[ProductAddEditSidebar] edit mode but no productId – skipping update')
          errorMessage.value = 'Cannot update: product ID is missing. Please close and open the product again.'
          return
        }
        console.log('[ProductAddEditSidebar] calling updateProduct', productId)
        await updateProduct(productId, productData)
        emit('save', { ...props.product, ...productData } as Product)
      } else {
        console.log('[ProductAddEditSidebar] calling createProduct (add mode)')
        const createdProduct = await createProduct(productData)
        emit('save', createdProduct)
      }
      
      emit('close')
      
      // Clean up blob URLs
      selectedFiles.value.forEach(() => {
        const url = previews.value.find(p => p.startsWith('blob:'))
        if (url) URL.revokeObjectURL(url)
      })
      
      // Reset form
      selectedFiles.value = []
    } catch (error: any) {
      errorMessage.value = error.message || `Failed to ${props.mode === 'edit' ? 'update' : 'create'} product`
      console.error(`Error ${props.mode === 'edit' ? 'updating' : 'creating'} product:`, error)
    } finally {
      isSubmitting.value = false
    }
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    previews.value.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    })
  })
</script>

  <template>
    <OnyxSidebar 
      :label="mode === 'add' ? 'Add Product' : 'Edit Product'"
      :temporary="{ open: localIsOpen }"
      @close="localIsOpen = false"
    >
      <template #description>
        {{ mode === 'add' ? 'Create a new product listing' : 'Update product information' }}
      </template>

      <div class="sidebar__content">
        <form @submit.prevent="submit" class="product-form">
            <!-- Title -->
            <OnyxInput
              v-model="title"
              label="Product Title"
              placeholder="Enter product title"
              required
            />
            
            <!-- Description -->
            <OnyxTextarea
              v-model="description"
              label="Description"
              placeholder="Enter product description"
              required
              :autosize="{ min: 3, max: 10 }"
            />
            
            <!-- Price and Quantity Row -->
            <div class="form-row">
              <OnyxStepper
                v-model="priceStepper"
                label="Price"
                :min="0"
                :step-size="0.01"
                :valid-step-size="0.01"
                :precision="2"
                required
              />
              <OnyxStepper
                v-model="quantity"
                label="Quantity"
                :min="0"
                :step-size="1"
                required
              />
            </div>
            
            <!-- Category and SKU Row -->
            <div class="form-row">
              <OnyxInput
                v-model="category"
                label="Category"
                placeholder="e.g., Electronics, Clothing"
              />
              <OnyxInput
                v-model="sku"
                label="SKU"
                placeholder="Product SKU"
              />
            </div>
            
            <!-- Condition -->
            <OnyxSelect
              v-model="condition"
              label="Condition"
              list-label="Product condition"
              :options="conditionOptions"
            />
            
            <!-- Tags -->
            <OnyxInput
              v-model="tags"
              label="Tags (comma-separated)"
              placeholder="e.g., electronics, smartphone, latest"
            />
            
            <!-- Availability Toggle -->
            <OnyxSwitch
              v-model="isAvailable"
              label="Product is available"
            />
            
            <!-- File Upload -->
            <OnyxFormElement :label="`Product Images (max ${maxFiles})`">
              <div class="file-upload">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  :disabled="previews.length >= maxFiles"
                  @change="handleFileChange"
                  class="file-input"
                />
              
              <div class="previews" v-if="previews.length > 0">
                <div
                  v-for="(url, index) in previews"
                  :key="index"
                  class="preview-wrapper"
                >
                  <img :src="url" alt="preview" class="preview" />
                  <OnyxIconButton
                    type="button"
                    class="remove-btn"
                    :icon="iconX"
                    :label="'Remove image ' + (index + 1)"
                    color="neutral"
                    @click="removeFile(index)"
                  />
                </div>
              </div>
              
              <p v-if="previews.length >= maxFiles" class="limit-msg">
                Maximum {{ maxFiles }} images uploaded
              </p>
              </div>
            </OnyxFormElement>
            
            <!-- Error Message -->
            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
            
        </form>
      </div>

      <template #footer>
        <OnyxButton
          label="Cancel"
          color="neutral"
          @click="localIsOpen = false"
          :disabled="isSubmitting"
        />
        <OnyxButton
          :label="mode === 'add' ? 'Create Product' : 'Update Product'"
          @click="submit"
          :disabled="isSubmitting"
        />
      </template>
    </OnyxSidebar>
</template>

<style scoped>

.sidebar__content {
  padding: var(--onyx-sidebar-padding);
  display: flex;
  flex-direction: column;
  gap: var(--onyx-density-2xs);
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: var(--onyx-density-md);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.file-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input {
  font-family: inherit;
  font-size: 14px;
  color: var(--onyx-color-base-text);
  border: 1px solid var(--onyx-color-base-border);
  border-radius: 6px;
  padding: 8px;
  background: var(--onyx-color-base-background);
  cursor: pointer;
  transition: border-color 0.2s;
}

.file-input:hover:not(:disabled) {
  border-color: var(--onyx-color-base-border-hover);
}

.file-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.preview-wrapper {
  width: 80px;
  height: 80px;
  position: relative;
  border: 1px solid var(--onyx-color-base-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--onyx-color-base-background);
}

.preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 24px !important;
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  transition: background 0.2s;
}

.remove-btn :deep(svg) {
  width: 14px;
  height: 14px;
}

.remove-btn:hover {
  background: rgba(0, 0, 0, 0.9) !important;
}

.limit-msg {
  color: var(--onyx-color-semantic-danger);
  font-size: 13px;
  margin: 0;
}

.error-message {
  padding: var(--onyx-density-sm);
  background: var(--onyx-color-semantic-danger-background);
  color: var(--onyx-color-semantic-danger);
  border-radius: var(--onyx-radius-md);
  font-size: var(--onyx-font-size-md);
}
</style>
