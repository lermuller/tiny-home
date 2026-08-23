// Registro compartilhado de "algum sheet está aberto" — o FAB vive no Layout, mas os sheets (ficha
// da tarefa, nova lista, nova tarefa) são abertos por telas filhas que ele não enxerga diretamente.
// Cada <Sheet> aberto se registra aqui; o Layout só precisa ler isAnyOpen().
let count = 0
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export const sheetVisibility = {
  isAnyOpen: () => count > 0,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  register() {
    count++
    emit()
  },
  unregister() {
    count = Math.max(0, count - 1)
    emit()
  },
}
