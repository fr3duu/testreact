const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  let data = {}
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    throw new Error(data.message || 'Błąd żądania')
  }

  return data
}
