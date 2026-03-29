<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter, page } = useData() as any

const formatDate = (val: any) => {
  if (!val) return ''
  const date = new Date(val)
  if (isNaN(date.getTime())) return val
  return date.toISOString().split('T')[0]
}

const downloadUrl = computed(() => {
  return `https://github.com/YuleBest/privacy-archive/raw/main/p/${page.value.relativePath}`
})
</script>

<template>
  <div v-if="frontmatter.lang && frontmatter.date" class="article-meta">
    <div class="meta-section">
      <div v-if="frontmatter.lang" class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-icon"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
        <span class="label">语言</span>
        <span class="value uppercase">{{ frontmatter.lang }}</span>
      </div>
      <div v-if="frontmatter.date" class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-icon"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        <span class="label">日期</span>
        <span class="value">{{ formatDate(frontmatter.date) }}</span>
      </div>
      <div v-if="frontmatter.version" class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-icon"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        <span class="label">版本</span>
        <span class="value">{{ formatDate(frontmatter.version) }}</span>
      </div>
    </div>

    <div class="meta-section">
      <div v-if="frontmatter.link" class="meta-item highlight">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        <a :href="frontmatter.link" target="_blank" rel="noopener" class="link">原文</a>
      </div>
      <div v-if="frontmatter.snapshot" class="meta-item highlight">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-icon"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
        <a :href="frontmatter.snapshot" target="_blank" rel="noopener" class="link">快照</a>
      </div>
      <div v-if="downloadUrl" class="meta-item highlight">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="meta-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <a :href="downloadUrl" target="_blank" rel="noopener" download class="link">下载</a>
      </div>
    </div>

    <div v-if="frontmatter.more && frontmatter.more.length > 0" class="more-versions-section">
      <span class="label">其他版本</span>
      <div class="versions-links">
        <a v-for="item in frontmatter.more" :key="item.link" :href="item.link" class="version-link">
          {{ item.text }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin-top: 1.5rem;
  margin-bottom: 2.5rem;
  font-family: var(--vp-font-family-base);
  transition: border-color 0.25s;
}

.article-meta:hover {
  border-color: var(--vp-c-brand-1);
}

.meta-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.meta-icon {
  opacity: 0.7;
  color: var(--vp-c-text-2);
}

.label {
  font-weight: 500;
  white-space: nowrap;
}

.value {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.uppercase {
  text-transform: uppercase;
}

.highlight .link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.highlight .link:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.more-versions-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.875rem;
}

.versions-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.version-link {
  padding: 0.2rem 0.6rem;
  background: var(--vp-c-bg-mute);
  border-radius: 6px;
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.version-link:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-3);
}

@media (min-width: 640px) {
  .meta-section {
    flex-wrap: nowrap;
  }
}
</style>
