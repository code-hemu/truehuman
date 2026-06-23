interface PluginMimeType {
  type: string
  suffixes: string
}

interface PluginInfo {
  name: string
  description: string
  mimeTypes: PluginMimeType[]
}

export function checkPlugins(): {
  value: PluginInfo[] | undefined
  codes: (string | number)[]
} {
  const rawPlugins = navigator.plugins
  if (!rawPlugins) {
    return { value: undefined, codes: [80.1] }
  }

  const plugins: PluginInfo[] = []
  for (let i = 0; i < rawPlugins.length; ++i) {
    const plugin = rawPlugins[i]
    if (!plugin) continue

    const mimeTypes: PluginMimeType[] = []
    for (let j = 0; j < plugin.length; ++j) {
      const mimeType = plugin[j]
      mimeTypes.push({
        type: mimeType.type,
        suffixes: mimeType.suffixes,
      })
    }

    plugins.push({
      name: plugin.name,
      description: plugin.description,
      mimeTypes,
    })
  }

  return { value: plugins, codes: [] }
}
