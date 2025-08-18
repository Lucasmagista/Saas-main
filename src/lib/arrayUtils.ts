/**
 * Utilitário para filtros seguros de arrays
 * Garante que operações de filter/map/reduce sejam sempre executadas em arrays válidos
 */

export const safeArray = <T>(data: T[] | null | undefined): T[] => {
  return Array.isArray(data) ? data : [];
};

export const safeFilter = <T>(
  data: T[] | null | undefined,
  predicate: (item: T) => boolean
): T[] => {
  const array = safeArray(data);
  return array.filter(predicate);
};

export const safeMap = <T, U>(
  data: T[] | null | undefined,
  mapFn: (item: T, index: number) => U
): U[] => {
  const array = safeArray(data);
  return array.map(mapFn);
};

export const safeReduce = <T, U>(
  data: T[] | null | undefined,
  reduceFn: (acc: U, current: T, index: number) => U,
  initialValue: U
): U => {
  const array = safeArray(data);
  return array.reduce(reduceFn, initialValue);
};

export const safeFind = <T>(
  data: T[] | null | undefined,
  predicate: (item: T) => boolean
): T | undefined => {
  const array = safeArray(data);
  return array.find(predicate);
};

export const safeFindIndex = <T>(
  data: T[] | null | undefined,
  predicate: (item: T) => boolean
): number => {
  const array = safeArray(data);
  return array.findIndex(predicate);
};

export const safeLength = <T>(data: T[] | null | undefined): number => {
  return safeArray(data).length;
};

export const safeSlice = <T>(
  data: T[] | null | undefined,
  start?: number,
  end?: number
): T[] => {
  const array = safeArray(data);
  return array.slice(start, end);
};

export const safeSome = <T>(
  data: T[] | null | undefined,
  predicate: (item: T) => boolean
): boolean => {
  const array = safeArray(data);
  return array.some(predicate);
};

export const safeEvery = <T>(
  data: T[] | null | undefined,
  predicate: (item: T) => boolean
): boolean => {
  const array = safeArray(data);
  return array.every(predicate);
};
