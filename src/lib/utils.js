// Immutably replace a single row by id in an array of rows.
// Usage: setList(updateRow(list, id, { field: value }))
// Equivalent to list.map(x => x.id === id ? { ...x, ...changes } : x)
// but shorter to read at call sites and harder to typo.
export const updateRow = (list, id, changes) =>
  list.map(x => x.id === id ? { ...x, ...changes } : x)
