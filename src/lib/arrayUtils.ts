/**
 * Utilitários para manipulação de arrays
 */

// Tipos genéricos para arrays
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
type SortableValue = string | number | Date;

/**
 * Ordena um array por uma propriedade específica
 */
export function sortBy<T extends Record<string, unknown>>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key] as SortableValue;
    const bVal = b[key] as SortableValue;
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filtra um array por múltiplas condições
 */
export function filterBy<T extends Record<string, unknown>>(
  array: T[],
  filters: Partial<Record<keyof T, unknown>>
): T[] {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      const itemValue = item[key as keyof T];
      if (value === undefined || value === null) return true;
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      return itemValue === value;
    });
  });
}

/**
 * Agrupa um array por uma propriedade específica
 */
export function groupBy<T extends Record<string, unknown>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicatas de um array baseado em uma propriedade
 */
export function uniqueBy<T extends Record<string, unknown>, K extends keyof T>(
  array: T[],
  key: K
): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Mapeia um array e retorna apenas os elementos não nulos
 */
export function mapNotNull<T, U>(
  array: T[],
  mapper: (item: T, index: number) => U | null | undefined
): U[] {
  const result: U[] = [];
  array.forEach((item, index) => {
    const mapped = mapper(item, index);
    if (mapped !== null && mapped !== undefined) {
      result.push(mapped);
    }
  });
  return result;
}

/**
 * Divide um array em chunks de tamanho específico
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Encontra o índice do primeiro elemento que satisfaz a condição
 */
export function findIndex<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): number {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      return i;
    }
  }
  return -1;
}

/**
 * Verifica se todos os elementos do array satisfazem a condição
 */
export function every<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): boolean {
  return array.every(predicate);
}

/**
 * Verifica se pelo menos um elemento do array satisfaz a condição
 */
export function some<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): boolean {
  return array.some(predicate);
}

/**
 * Retorna o primeiro elemento que satisfaz a condição
 */
export function find<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): T | undefined {
  return array.find(predicate);
}

/**
 * Retorna o último elemento que satisfaz a condição
 */
export function findLast<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): T | undefined {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i)) {
      return array[i];
    }
  }
  return undefined;
}

/**
 * Retorna o elemento com o valor máximo de uma propriedade
 */
export function maxBy<T extends Record<string, unknown>, K extends keyof T>(
  array: T[],
  key: K
): T | undefined {
  if (array.length === 0) return undefined;
  
  return array.reduce((max, current) => {
    const maxVal = max[key] as number;
    const currentVal = current[key] as number;
    return currentVal > maxVal ? current : max;
  });
}

/**
 * Retorna o elemento com o valor mínimo de uma propriedade
 */
export function minBy<T extends Record<string, unknown>, K extends keyof T>(
  array: T[],
  key: K
): T | undefined {
  if (array.length === 0) return undefined;
  
  return array.reduce((min, current) => {
    const minVal = min[key] as number;
    const currentVal = current[key] as number;
    return currentVal < minVal ? current : min;
  });
}

/**
 * Calcula a soma de uma propriedade numérica
 */
export function sumBy<T extends Record<string, unknown>, K extends keyof T>(
  array: T[],
  key: K
): number {
  return array.reduce((sum, item) => {
    const value = item[key] as number;
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
}

/**
 * Calcula a média de uma propriedade numérica
 */
export function averageBy<T extends Record<string, unknown>, K extends keyof T>(
  array: T[],
  key: K
): number {
  if (array.length === 0) return 0;
  return sumBy(array, key) / array.length;
}

/**
 * Retorna os primeiros N elementos do array
 */
export function take<T>(array: T[], count: number): T[] {
  return array.slice(0, count);
}

/**
 * Retorna os últimos N elementos do array
 */
export function takeLast<T>(array: T[], count: number): T[] {
  return array.slice(-count);
}

/**
 * Remove os primeiros N elementos do array
 */
export function drop<T>(array: T[], count: number): T[] {
  return array.slice(count);
}

/**
 * Remove os últimos N elementos do array
 */
export function dropLast<T>(array: T[], count: number): T[] {
  return array.slice(0, -count);
}

/**
 * Mistura aleatoriamente os elementos de um array
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Retorna um elemento aleatório do array
 */
export function random<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Retorna N elementos aleatórios do array
 */
export function randomSample<T>(array: T[], count: number): T[] {
  const shuffled = shuffle(array);
  return take(shuffled, Math.min(count, array.length));
}

/**
 * Cria um array com valores únicos
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Retorna a diferença entre dois arrays
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
  const set2 = new Set(array2);
  return array1.filter(item => !set2.has(item));
}

/**
 * Retorna a interseção entre dois arrays
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
  const set2 = new Set(array2);
  return array1.filter(item => set2.has(item));
}

/**
 * Retorna a união entre dois arrays
 */
export function union<T>(array1: T[], array2: T[]): T[] {
  return unique([...array1, ...array2]);
}
