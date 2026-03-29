<script setup lang="ts">
import { useData, useRouter, withBase } from 'vitepress'
import { computed, ref, watch } from 'vue'
import pversionsData from '../configs/pversions.json'

const { frontmatter, page } = useData() as any
const router = useRouter()

const rawModules = (import.meta as any).glob('../../p/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const copyText = ref('复制')
const onCopy = async () => {
  const relPath = page.value.relativePath
  const key = `../../p/${relPath}`
  const content = rawModules[key] || ''
  // Remove frontmatter
  const cleanContent = content.replace(/^---\n[\s\S]*?\n---\n/, '').trim()

  if (!cleanContent) return

  try {
    await navigator.clipboard.writeText(cleanContent)
    copyText.value = '已复制'
    setTimeout(() => {
      copyText.value = '复制'
    }, 2000)
  } catch (err) {
    console.error('Copy failed', err)
    copyText.value = '失败'
    setTimeout(() => {
      copyText.value = '复制'
    }, 2000)
  }
}

const onDownload = () => {
  const relPath = page.value.relativePath
  const key = `../../p/${relPath}`
  const content = rawModules[key] || ''
  // Remove frontmatter
  const cleanContent = content.replace(/^---\n[\s\S]*?\n---\n/, '').trim()

  if (!cleanContent) return

  const blob = new Blob([cleanContent], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // Filename logic: language-product-version.md
  const fileName = relPath.split('/').filter(Boolean).join('-')
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const shareText = ref('分享')
const onShare = async () => {
  const title = frontmatter.value.title || page.value.title || ''
  const langName = langMap[frontmatter.value.lang] || frontmatter.value.lang || ''
  const version = formatDate(frontmatter.value.version)

  // Construct absolute encoded URL
  const baseUrl = 'https://pa.21acg.cn'
  const path = page.value.relativePath.replace(/\.md$/, '')
  // Encode each segment of the path except slashes
  const encodedPath = path
    .split('/')
    .map((s: string) => encodeURIComponent(s))
    .join('/')
  const url = `${baseUrl}/${encodedPath}`

  const text = `【《${title}》${langName} ${version}版本丨隐私政策档案馆】${url}`

  try {
    await navigator.clipboard.writeText(text)
    shareText.value = '已复制'
    setTimeout(() => {
      shareText.value = '分享'
    }, 2000)
  } catch (err) {
    console.error('Share failed', err)
    shareText.value = '失败'
    setTimeout(() => {
      shareText.value = '分享'
    }, 2000)
  }
}

const langMap: Record<string, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文（臺灣）',
  'zh-HK': '繁體中文（香港）',
  'en-US': 'English',
}

const formatDate = (val: any) => {
  if (!val) return ''
  const date = new Date(val)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }
  return val.toString()
}

const pversion = computed(() => frontmatter.value.pversion)
const currentMapping = computed(() =>
  pversion.value ? (pversionsData as any)[pversion.value] : null,
)

// Staged selection state
const selectedLang = ref(frontmatter.value.lang)
const selectedVersion = ref(formatDate(frontmatter.value.version))

watch(
  () => frontmatter.value.lang,
  (v) => {
    selectedLang.value = v
  },
)
watch(
  () => frontmatter.value.version,
  (v) => {
    selectedVersion.value = formatDate(v)
  },
)

const availableLangs = computed(() => {
  if (!currentMapping.value) return []
  return Object.keys(currentMapping.value)
})

const availableVersions = computed(() => {
  if (!currentMapping.value || !selectedLang.value) return []
  return currentMapping.value[selectedLang.value]?.versions || []
})

const onLangChange = (e: Event) => {
  const newLang = (e.target as HTMLSelectElement).value
  selectedLang.value = newLang
  // Auto-select latest version of the new language
  const target = currentMapping.value?.[newLang]
  if (target?.versions?.length > 0) {
    selectedVersion.value = target.versions[0]
  }
}

const onVersionChange = (e: Event) => {
  selectedVersion.value = (e.target as HTMLSelectElement).value
}

const hasChanges = computed(() => {
  return (
    selectedLang.value !== frontmatter.value.lang ||
    selectedVersion.value !== formatDate(frontmatter.value.version)
  )
})

const onJump = () => {
  if (!currentMapping.value || !selectedLang.value || !selectedVersion.value) return
  const target = currentMapping.value[selectedLang.value]
  if (target) {
    router.go(`/${selectedLang.value}${target.path}/${selectedVersion.value}`)
  }
}

const snapshotUrl = computed(() => {
  if (!frontmatter.value.link || !frontmatter.value.date) return null
  const dateStr = formatDate(frontmatter.value.date).replace(/-/g, '')
  return `https://web.archive.org/web/${dateStr}000000*/${frontmatter.value.link}`
})

const diffUrl = computed(() => {
  if (!pversion.value) return null
  return withBase(
    `/diff?id=${pversion.value}&lang=${frontmatter.value.lang}&v=${formatDate(frontmatter.value.version)}`,
  )
})
</script>

<template>
  <div v-if="frontmatter.lang || frontmatter.date || frontmatter.version" class="article-meta">
    <!-- Jump Row (Visible when selection changed) -->
    <div v-if="hasChanges" class="jump-row">
      <button @click="onJump" class="jump-button" title="点击跳转到所选版本">
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
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        跳转
      </button>
    </div>

    <div class="meta-section">
      <!-- Language Selector -->
      <div v-if="frontmatter.lang" class="meta-item">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="meta-icon"
        >
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
        <span class="label">语言</span>
        <select
          v-if="availableLangs.length > 0"
          :value="selectedLang"
          @change="onLangChange"
          class="meta-select"
        >
          <option v-for="l in availableLangs" :key="l" :value="l">
            {{ langMap[l] || l }}
          </option>
        </select>
        <span v-else class="value uppercase">{{ frontmatter.lang }}</span>
      </div>

      <!-- Version Selector -->
      <div v-if="frontmatter.version" class="meta-item">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="meta-icon"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span class="label">版本</span>
        <select
          v-if="availableVersions.length > 0"
          :value="selectedVersion"
          @change="onVersionChange"
          class="meta-select"
        >
          <option v-for="v in availableVersions" :key="v" :value="v">
            {{ formatDate(v) }}
          </option>
        </select>
        <span v-else class="value">{{ formatDate(frontmatter.version) }}</span>
      </div>


    </div>

    <div class="meta-section">
      <div v-if="frontmatter.link" class="meta-item highlight">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="meta-icon"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <a :href="frontmatter.link" target="_blank" rel="noopener" class="link">原文</a>
      </div>
      <div v-if="snapshotUrl" class="meta-item highlight">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="meta-icon"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
        <a :href="snapshotUrl" target="_blank" rel="noopener" class="link">快照</a>
      </div>
      <div class="meta-item highlight">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="meta-icon"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <button @click="onDownload" class="link-btn">下载</button>
      </div>
      <div v-if="diffUrl" class="meta-item highlight">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="meta-icon"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M12 3v18" />
        </svg>
        <a :href="diffUrl" target="_blank" rel="noopener" class="link">对比</a>
      </div>
      <div class="meta-item highlight">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="meta-icon"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" x2="12" y1="2" y2="15" />
        </svg>
        <button
          @click="onShare"
          class="link-btn"
          :class="{ success: shareText === '已复制' }"
        >
          {{ shareText }}
        </button>
      </div>
      <div class="meta-item highlight">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="meta-icon"
        >
          <rect width="9" height="9" x="9" y="9" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <button @click="onCopy" class="link-btn" :class="{ success: copyText === '已复制' }">
          {{ copyText }}
        </button>
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

.jump-row {
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px dashed var(--vp-c-divider);
  padding-bottom: 0.5rem;
  margin-bottom: 0.25rem;
}

.jump-button {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
  background: transparent;
  color: var(--vp-c-brand-1);
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.jump-button:hover {
  opacity: 0.7;
  text-decoration: underline;
}

.jump-button:active {
  opacity: 0.5;
}

/* Sidebar overrides */
:deep(.VPDocAside) .jump-row {
  padding-bottom: 0.25rem;
  margin-bottom: 0.1rem;
}

:deep(.VPDocAside) .jump-button {
  font-size: 0.7rem;
}

/* Responsive display logic */
.article-meta.is-inline {
  display: flex;
}

@media (min-width: 1280px) {
  .article-meta.is-inline {
    display: none;
  }
}

/* Adjustments when inside the aside sidebar */
:deep(.VPDocAside) .article-meta,
footer .article-meta {
  border: none;
  padding: 0;
  margin: 0 0 1rem 0;
  gap: 0.15rem;
}

.article-meta:hover {
  border-color: var(--vp-c-brand-1);
}

.meta-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

/* Force single column only in the sidebar */
:deep(.VPDocAside) .meta-section {
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

:deep(.VPDocAside) .meta-item {
  line-height: 1.4;
  font-size: 0.725rem;
  margin: 0.05rem 0;
  padding-left: 0.5rem;
  flex-wrap: wrap; /* Enable wrapping for sidebar overflow */
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
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

.meta-select {
  background: transparent;
  border: none;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  margin: 0;
  outline: none;
  text-transform: uppercase;
}

.meta-select:hover {
  color: var(--vp-c-brand-2);
}

.meta-select option {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.uppercase {
  text-transform: uppercase;
}

.highlight .link,
.highlight .link-btn {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
  background: transparent;
  border: none;
  padding: 0;
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
}

.highlight .link:hover,
.highlight .link-btn:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.highlight .link-btn.success {
  color: var(--vp-c-green-1);
}
</style>
