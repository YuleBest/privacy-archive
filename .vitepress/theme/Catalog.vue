<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

const props = defineProps({
  level: {
    type: Number,
    default: 4,
  },
  base: {
    type: String,
    default: '',
  },
  // Internal props for recursion
  items: {
    type: Array as () => any[],
    default: null,
  },
  depth: {
    type: Number,
    default: 0,
  },
})

const { page } = useData()

// Only run the glob and tree building in the root component
const modules = props.items
  ? {}
  : (import.meta as any).glob(['../../p/**/*.md', '../../p/*.md'], { eager: true })

const catalogTree = computed(() => {
  if (props.items) return props.items

  const currentPath = props.base || page.value.relativePath
  const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1)

  const allPages = Object.entries(modules).map(([path, mod]: [string, any]) => {
    let vitePressPath = path.replace('../../p/', '')
    const fm = mod.frontmatter || mod.__pageData?.frontmatter || {}
    return {
      path: vitePressPath,
      title:
        fm.title ||
        mod.__pageData?.title ||
        vitePressPath.split('/').pop()?.replace('.md', ''),
      frontmatter: fm,
      dir: vitePressPath.substring(0, vitePressPath.lastIndexOf('/') + 1),
    }
  })

  function buildSubTree(dir: string, currentLevel: number): any[] {
    if (currentLevel > props.level) return []

    const files = allPages
      .filter((f) => f.dir === dir && !f.path.endsWith('index.md'))
      .sort((a, b) => {
        const vA = a.frontmatter?.version
        const vB = b.frontmatter?.version
        if (vA && vB) {
          const dA = new Date(vA).getTime()
          const dB = new Date(vB).getTime()
          if (!isNaN(dA) && !isNaN(dB)) {
            return dB - dA
          }
          return String(vB).localeCompare(String(vA))
        }
        return a.title.localeCompare(b.title)
      })
      .map((f) => ({ ...f, type: 'file' }))

    const subDirPaths = [
      ...new Set(
        allPages
          .filter((f) => f.dir.startsWith(dir) && f.dir !== dir)
          .map((f) => {
            const relative = f.dir.slice(dir.length)
            const firstPart = relative.split('/')[0]
            return dir + firstPart + '/'
          }),
      ),
    ]

    const dirs = subDirPaths.map((path) => {
      const children = buildSubTree(path, currentLevel + 1)

      const indexPath = path + 'index.md'
      const hasIndex = allPages.some((p) => p.path === indexPath)

      return {
        path,
        type: 'dir',
        title: path.split('/').filter(Boolean).pop(),
        indexPath: hasIndex ? indexPath : null,
        children,
      }
    }) as any[]

    return [...files, ...dirs]
  }

  return buildSubTree(currentDir, 1)
})

const formatDate = (val: any) => {
  if (!val) return ''
  const date = new Date(val)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]
  }
  return val.toString()
}

const resolveLink = (path: string) => {
  return withBase('/' + path.replace('.md', ''))
}
</script>

<template>
  <div
    :class="['catalog', { recursive: depth > 0 }]"
    :style="{ marginLeft: depth > 0 ? '1.25rem' : '0' }"
  >
    <div class="catalog-list">
      <template v-for="item in catalogTree" :key="item.path">
        <div v-if="item.type === 'file'" class="catalog-item">
          <a :href="resolveLink(item.path)" class="catalog-link">
            <div class="title-wrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="octicon"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
              <span class="catalog-title">{{ item.title }}</span>
            </div>
            <span v-if="item.frontmatter?.version" class="catalog-date">{{
              formatDate(item.frontmatter.version)
            }}</span>
          </a>
        </div>
        <div v-else class="catalog-subdir">
          <div class="subdir-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="octicon-dir"
            >
              <path
                d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
              />
            </svg>
            <component
              :is="item.indexPath ? 'a' : 'span'"
              :href="item.indexPath ? resolveLink(item.indexPath) : null"
              class="subdir-title"
              :class="{ 'is-link': item.indexPath }"
            >
              {{ item.title }}
            </component>
          </div>
          <!-- Recursive call to Catalog component -->
          <Catalog :items="item.children" :depth="depth + 1" :level="level" />
        </div>
      </template>
    </div>
    <div v-if="depth === 0 && catalogTree.length === 0" class="catalog-empty">暂无文档</div>
  </div>
</template>

<style scoped>
.catalog {
  margin: 1.5rem 0;
}

.catalog.recursive {
  margin: 0.25rem 0;
  border-left: 2px solid var(--vp-c-divider);
  padding-left: 0.75rem;
}

.catalog-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.catalog-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition: all 0.2s;
}

.catalog-item:hover {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
}

.catalog-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.8rem;
  text-decoration: none !important;
  color: var(--vp-c-text-1) !important;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
}

.octicon {
  opacity: 0.6;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

.octicon-dir {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.catalog-title {
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.catalog-date {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  flex-shrink: 0;
}

.catalog-subdir {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.subdir-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  letter-spacing: 0.05em;
}

.subdir-title {
  color: var(--vp-c-text-1);
}

.subdir-title.is-link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  cursor: pointer;
}

.subdir-title.is-link:hover {
  text-decoration: underline;
}

.catalog-empty {
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  text-align: center;
  padding: 2rem;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
}
</style>
