<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { createTwoFilesPatch } from 'diff'
import { html } from 'diff2html'
import 'diff2html/bundles/css/diff2html.min.css'
import pversionsData from '../configs/pversions.json'

const pversions = pversionsData as Record<string, any>

// Load all markdown files as raw text
const rawModules = (import.meta as any).glob('../../p/**/*.md', { as: 'raw', eager: true })

const productIds = Object.keys(pversions)
const selectedProduct = ref(productIds[0] || '')

const languages = computed(() => {
  const product = pversions[selectedProduct.value]
  return product ? Object.keys(product) : []
})
const selectedLang = ref('')

const versions = computed(() => {
  const product = pversions[selectedProduct.value]
  const lang = product ? product[selectedLang.value] : null
  return lang ? lang.versions : []
})

const versionA = ref('')
const versionB = ref('')
const diffResult = ref('')
const isLoading = ref(false)

const updateSelectedLang = () => {
  if (languages.value.length > 0) {
    if (!languages.value.includes(selectedLang.value)) {
      selectedLang.value = languages.value[0]
    }
  } else {
    selectedLang.value = ''
  }
}

const updateVersions = () => {
  if (versions.value.length >= 2) {
    versionA.value = versions.value[1] // Older version (base)
    versionB.value = versions.value[0] // Newer version
  } else if (versions.value.length === 1) {
    versionA.value = versions.value[0]
    versionB.value = versions.value[0]
  } else {
    versionA.value = ''
    versionB.value = ''
  }
}

watch(selectedProduct, () => {
  updateSelectedLang()
  updateVersions()
  generateDiff()
})

watch(selectedLang, () => {
  updateVersions()
  generateDiff()
})

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')
  const lang = params.get('lang')
  const v = params.get('v')

  if (id && pversions[id]) {
    selectedProduct.value = id
    
    // Update languages list
    const product = pversions[id]
    const availableLangs = Object.keys(product)
    
    if (lang && availableLangs.includes(lang)) {
      selectedLang.value = lang
    } else {
      selectedLang.value = availableLangs[0] || ''
    }
    
    // Update versions list based on new language
    const langData = product[selectedLang.value]
    const availableVersions = langData ? langData.versions : []
    
    if (v && availableVersions.includes(v)) {
      // Set current as comparison version (B)
      versionB.value = v
      // Try to find previous version for base (A)
      const idx = availableVersions.indexOf(v)
      if (idx + 1 < availableVersions.length) {
        versionA.value = availableVersions[idx + 1]
      } else {
        versionA.value = v
      }
    } else {
      updateVersions()
    }
  } else {
    updateSelectedLang()
    updateVersions()
  }
  
  generateDiff()
})

const generateDiff = () => {
  if (!versionA.value || !versionB.value || !selectedProduct.value || !selectedLang.value) {
    diffResult.value = '<div class="diff-empty">请选择要对比的版本</div>'
    return
  }

  isLoading.value = true
  
  try {
    const product = pversions[selectedProduct.value]
    const langConfig = product[selectedLang.value]
    const basePath = langConfig.path

    // Construct the keys as they appear in import.meta.glob
    // The keys are usually relative to the file where glob is called, or absolute from project root depending on environment
    // In Vite, they are usually relative to the current file
    const keyA = `../../p/${selectedLang.value}${basePath}/${versionA.value}.md`
    const keyB = `../../p/${selectedLang.value}${basePath}/${versionB.value}.md`

    const contentA = rawModules[keyA] || ''
    const contentB = rawModules[keyB] || ''

    if (!contentA || !contentB) {
      console.warn('Matching files not found:', { keyA, keyB })
      // Try alternative key format if needed (sometimes Vite uses /p/... or ./../../p/...)
      // But let's assume the relative path works first.
    }

    // Remove frontmatter for diffing
    const cleanContentA = contentA.replace(/^---\n[\s\S]*?\n---\n/, '')
    const cleanContentB = contentB.replace(/^---\n[\s\S]*?\n---\n/, '')

    const patch = createTwoFilesPatch(
      `${versionA.value}`,
      `${versionB.value}`,
      cleanContentA,
      cleanContentB
    )

    const outputHtml = html(patch, {
      drawFileList: false,
      matching: 'lines',
      outputFormat: 'side-by-side',
      renderNothingWhenEmpty: false,
    })

    diffResult.value = outputHtml
  } catch (err: any) {
    console.error('Diff generation failed:', err)
    diffResult.value = `<div class="diff-error">对比失败: ${err.message}</div>`
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="diff-viewer">
    <div class="diff-controls card">
      <div class="control-group">
        <label>文档项目</label>
        <select v-model="selectedProduct">
          <option v-for="id in productIds" :key="id" :value="id">
            {{ id }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label>语言</label>
        <select v-model="selectedLang">
          <option v-for="lang in languages" :key="lang" :value="lang">
            {{ lang }}
          </option>
        </select>
      </div>

      <div class="version-select">
        <div class="control-group">
          <label>基准版本 (A)</label>
          <select v-model="versionA">
            <option v-for="v in versions" :key="v" :value="v">
              {{ v }}
            </option>
          </select>
        </div>
        <div class="version-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
        <div class="control-group">
          <label>对比版本 (B)</label>
          <select v-model="versionB">
            <option v-for="v in versions" :key="v" :value="v">
              {{ v }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="actions">
        <button class="btn-primary" @click="generateDiff" :disabled="isLoading">
          {{ isLoading ? '拼命对比中...' : '开始对比' }}
        </button>
      </div>
    </div>

    <div class="diff-output-container" v-html="diffResult"></div>
  </div>
</template>

<style scoped>
.diff-viewer {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  max-width: 1600px; /* Even wider for better comparison */
}

.card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.5rem;
}

.diff-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 150px;
}

.control-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.control-group select {
  appearance: none;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  padding-right: 2.5rem;
  transition: border-color 0.2s;
}

.control-group select:focus {
  border-color: var(--vp-c-brand-1);
  outline: none;
}

.version-select {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex: 2;
  min-width: 350px;
}

.version-arrow {
  padding-bottom: 0.6rem;
  color: var(--vp-c-text-3);
}

.btn-primary {
  background-color: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.diff-output-container {
  overflow-x: auto;
}

:deep(.diff2html) {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

:deep(.d2h-file-header) {
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 10px 15px;
}

:deep(.d2h-file-name) {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

:deep(.d2h-diff-table) {
  background-color: var(--vp-c-bg);
}

:deep(.d2h-code-line-ctn) {
  color: var(--vp-c-text-1);
}

:deep(.d2h-code-line-prefix) {
  color: var(--vp-c-text-2);
}

:deep(.d2h-ins) {
  background-color: rgba(63, 185, 80, 0.15);
}

:deep(.d2h-del) {
  background-color: rgba(248, 81, 73, 0.15);
}

:deep(.d2h-change) {
  background-color: rgba(187, 128, 9, 0.15);
}

:deep(.d2h-info) {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
}

.diff-empty, .diff-error {
  padding: 3rem;
  text-align: center;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
}

.diff-error {
  color: var(--vp-c-danger-1);
  border-color: var(--vp-c-danger-1);
}

@media (max-width: 768px) {
  .diff-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .version-select {
    flex-direction: column;
    align-items: stretch;
    min-width: unset;
  }
  
  .version-arrow {
    display: none;
  }
}
</style>
