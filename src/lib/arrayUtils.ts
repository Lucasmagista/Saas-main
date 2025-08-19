/**
 * Utilitários de segurança para arrays
 * Previne erros comuns como "filter is not a function" e "map is not a function"
 */

/**
 * Garante que o valor é um array, retornando array vazio se não for
 */
export function safeArray<T>(value: any): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  // Se for um objeto iterável, tenta converter
  if (value && typeof value[Symbol.iterator] === 'function') {
    try {
      return Array.from(value);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Executa filter de forma segura, garantindo que sempre retorna um array
 */
export function safeFilter<T>(array: any, predicate: (value: T, index: number, array: T[]) => boolean): T[] {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.filter(predicate);
  } catch (error) {
    console.warn('Erro ao executar filter:', error);
    return [];
  }
}

/**
 * Executa map de forma segura, garantindo que sempre retorna um array
 */
export function safeMap<T, U>(array: any, mapper: (value: T, index: number, array: T[]) => U): U[] {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.map(mapper);
  } catch (error) {
    console.warn('Erro ao executar map:', error);
    return [];
  }
}

/**
 * Executa reduce de forma segura
 */
export function safeReduce<T, U>(
  array: any, 
  reducer: (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U, 
  initialValue: U
): U {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.reduce(reducer, initialValue);
  } catch (error) {
    console.warn('Erro ao executar reduce:', error);
    return initialValue;
  }
}

/**
 * Executa find de forma segura
 */
export function safeFind<T>(array: any, predicate: (value: T, index: number, array: T[]) => boolean): T | undefined {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.find(predicate);
  } catch (error) {
    console.warn('Erro ao executar find:', error);
    return undefined;
  }
}

/**
 * Executa findIndex de forma segura
 */
export function safeFindIndex<T>(array: any, predicate: (value: T, index: number, array: T[]) => boolean): number {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.findIndex(predicate);
  } catch (error) {
    console.warn('Erro ao executar findIndex:', error);
    return -1;
  }
}

/**
 * Executa some de forma segura
 */
export function safeSome<T>(array: any, predicate: (value: T, index: number, array: T[]) => boolean): boolean {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.some(predicate);
  } catch (error) {
    console.warn('Erro ao executar some:', error);
    return false;
  }
}

/**
 * Executa every de forma segura
 */
export function safeEvery<T>(array: any, predicate: (value: T, index: number, array: T[]) => boolean): boolean {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.every(predicate);
  } catch (error) {
    console.warn('Erro ao executar every:', error);
    return false;
  }
}

/**
 * Executa slice de forma segura
 */
export function safeSlice<T>(array: any, start?: number, end?: number): T[] {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.slice(start, end);
  } catch (error) {
    console.warn('Erro ao executar slice:', error);
    return [];
  }
}

/**
 * Executa sort de forma segura
 */
export function safeSort<T>(array: any, compareFn?: (a: T, b: T) => number): T[] {
  const safeArr = safeArray<T>(array);
  try {
    return [...safeArr].sort(compareFn);
  } catch (error) {
    console.warn('Erro ao executar sort:', error);
    return [...safeArr];
  }
}

/**
 * Obtém o comprimento de forma segura
 */
export function safeLength(array: any): number {
  const safeArr = safeArray(array);
  return safeArr.length;
}

/**
 * Verifica se o array está vazio de forma segura
 */
export function safeIsEmpty(array: any): boolean {
  return safeLength(array) === 0;
}

/**
 * Obtém o primeiro elemento de forma segura
 */
export function safeFirst<T>(array: any): T | undefined {
  const safeArr = safeArray<T>(array);
  return safeArr[0];
}

/**
 * Obtém o último elemento de forma segura
 */
export function safeLast<T>(array: any): T | undefined {
  const safeArr = safeArray<T>(array);
  return safeArr[safeArr.length - 1];
}

/**
 * Combina múltiplos arrays de forma segura
 */
export function safeConcat<T>(...arrays: any[]): T[] {
  try {
    return arrays.reduce((result, arr) => {
      return result.concat(safeArray<T>(arr));
    }, [] as T[]);
  } catch (error) {
    console.warn('Erro ao executar concat:', error);
    return [];
  }
}

/**
 * Remove duplicatas de forma segura
 */
export function safeUnique<T>(array: any): T[] {
  const safeArr = safeArray<T>(array);
  try {
    return [...new Set(safeArr)];
  } catch (error) {
    console.warn('Erro ao remover duplicatas:', error);
    return safeArr;
  }
}

/**
 * Agrupa elementos por uma chave de forma segura
 */
export function safeGroupBy<T>(array: any, keyFn: (item: T) => string): Record<string, T[]> {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  } catch (error) {
    console.warn('Erro ao agrupar elementos:', error);
    return {};
  }
}

/**
 * Conta elementos por uma condição de forma segura
 */
export function safeCountBy<T>(array: any, predicate: (item: T) => string): Record<string, number> {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.reduce((counts, item) => {
      const key = predicate(item);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  } catch (error) {
    console.warn('Erro ao contar elementos:', error);
    return {};
  }
}

/**
 * Verifica se um valor existe no array de forma segura
 */
export function safeIncludes<T>(array: any, value: T): boolean {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.includes(value);
  } catch (error) {
    console.warn('Erro ao verificar inclusão:', error);
    return false;
  }
}

/**
 * Executa forEach de forma segura
 */
export function safeForEach<T>(array: any, callback: (value: T, index: number, array: T[]) => void): void {
  const safeArr = safeArray<T>(array);
  try {
    safeArr.forEach(callback);
  } catch (error) {
    console.warn('Erro ao executar forEach:', error);
  }
}

/**
 * Cria um array de números de forma segura
 */
export function safeRange(start: number, end: number, step: number = 1): number[] {
  try {
    const result = [];
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
    return result;
  } catch (error) {
    console.warn('Erro ao criar range:', error);
    return [];
  }
}

/**
 * Chunk array em grupos de tamanho específico
 */
export function safeChunk<T>(array: any, size: number): T[][] {
  const safeArr = safeArray<T>(array);
  try {
    const chunks = [];
    for (let i = 0; i < safeArr.length; i += size) {
      chunks.push(safeArr.slice(i, i + size));
    }
    return chunks;
  } catch (error) {
    console.warn('Erro ao criar chunks:', error);
    return [];
  }
}

/**
 * Flatten array aninhado de forma segura
 */
export function safeFlatten<T>(array: any, depth: number = 1): T[] {
  const safeArr = safeArray<T>(array);
  try {
    return safeArr.flat(depth);
  } catch (error) {
    console.warn('Erro ao flatten array:', error);
    return safeArr;
  }
}
