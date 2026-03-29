<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

const { page } = useData()

const langMap: Record<string, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文（臺灣）',
  'zh-HK': '繁體中文（香港）',
  'en-US': 'English'
}

const breadcrumbs = computed(() => {
  const segments = page.value.relativePath.replace(/\.md$/, '').split('/')
  if (segments[segments.length - 1] === 'index') segments.pop()

  const result = []
  let accumulated = ''

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    accumulated += (i === 0 ? '' : '/') + segment
    
    // Use translated name if it's a locale code
    let text = langMap[segment] || decodeURIComponent(segment)
    
    result.push({
      text,
      link: withBase('/' + accumulated)
    })
  }

  return result
})
</script>

<template>
  <nav v-if="breadcrumbs.length > 0" class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item home">
        <a :href="withBase('/')" class="breadcrumb-link" title="首页">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </a>
      </li>
      <li v-for="(crumb, index) in breadcrumbs" :key="crumb.link" class="breadcrumb-item">
        <span class="separator">/</span>
        <a 
          v-if="index < breadcrumbs.length - 1" 
          :href="crumb.link" 
          class="breadcrumb-link"
        >
          {{ crumb.text }}
        </a>
        <span v-else class="breadcrumb-current">{{ crumb.text }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumb {
  margin-bottom: 1.25rem;
  padding-bottom: 0;
  font-family: var(--vp-font-family-base);
  font-size: 0.8125rem;
}

.breadcrumb-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  color: var(--vp-c-text-2);
}

.breadcrumb-link {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.25s;
}

.breadcrumb-link:hover {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}

.breadcrumb-current {
  color: var(--vp-c-text-1);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.separator {
  margin: 0 0.15rem;
  font-size: 0.75rem;
  opacity: 0.5;
  color: var(--vp-c-text-3);
}

.home .breadcrumb-link {
  display: flex;
  align-items: center;
}

@media (min-width: 640px) {
  .breadcrumb-current {
    max-width: 350px;
  }
}
</style>
