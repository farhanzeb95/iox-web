<script setup lang="ts">
  import { OnyxCard, OnyxIcon } from 'sit-onyx'

  defineProps<{
    title: string
    value: string | number
    /** Onyx icon SVG string from @sit-onyx/icons */
    icon?: string
  }>();
  </script>
  
  <template>
    <OnyxCard class="stat-card">
      <div class="icon" v-if="icon">
        <OnyxIcon :icon="icon" size="24px" color="currentColor" />
      </div>
      <div class="info">
        <div class="title">{{ title }}</div>
        <div class="value">{{ value }}</div>
      </div>
    </OnyxCard>
  </template>
  
  <style scoped>
  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    color: var(--onyx-color-text-icons-neutral-intense);
  }
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .title { font-size: 14px; color: var(--onyx-color-base-text-secondary); }
  .value { font-size: 20px; font-weight: 600; color: var(--onyx-color-base-text); }
  </style>
  