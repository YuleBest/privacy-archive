import fs from 'node:fs'
import path from 'node:path'

/**
 * Automatically generate the sidebar configuration from a file system structure.
 * Designed to mirror VuePress Hope's folder-driven automation.
 */
export function getSidebar(dir: string, _base: string = '') {
  const pPath = path.resolve(process.cwd(), 'p', dir)
  if (!fs.existsSync(pPath)) {
    console.warn(`Sidebar directory not found: ${pPath}`)
    return []
  }

  const result: any[] = []
  const files = fs.readdirSync(pPath)

  // Sort: start.md first, then Directories, then files.
  files.sort((a, b) => {
    if (a === 'start.md') return -1
    if (b === 'start.md') return 1

    const aPath = path.join(pPath, a)
    const bPath = path.join(pPath, b)
    const aIsDir = fs.statSync(aPath).isDirectory()
    const bIsDir = fs.statSync(bPath).isDirectory()
    
    if (aIsDir && !bIsDir) return -1
    if (!aIsDir && bIsDir) return 1
    return b.localeCompare(a) // Date-like filenames (latest top)
  })

  for (const file of files) {
    if (file.startsWith('.') || file === 'index.md') continue

    const filePath = path.join(pPath, file)
    const isDir = fs.statSync(filePath).isDirectory()
    const relative = path.join(dir, file).replace(/\\/g, '/')

    if (isDir) {
      const children = getSidebar(relative)
      if (children.length > 0) {
        const hasIndex = fs.existsSync(path.join(filePath, 'index.md'))
        result.push({
          text: file,
          collapsed: true,
          link: hasIndex ? `/${relative}/` : undefined,
          items: children
        })
      }
    } else if (file.endsWith('.md')) {
      result.push({
        text: file.replace('.md', ''),
        link: `/${relative.replace('.md', '')}`
      })
    }
  }

  return result
}
