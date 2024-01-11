type StorageEventListener = (event: StorageEvent) => void;

const registry: Map<string, StorageEventListener[]> = new Map();

export const eventEmitter = {
  on(key: string, callback: StorageEventListener) {
    const list = registry.get(key);
    registry.set(key, list ? [...list, callback] : [callback]);
  },
  off(key: string, callback: StorageEventListener) {
    const list = registry.get(key);

    if (!list) {
      return;
    }

    const newList = list.filter((item) => item !== callback);

    if (newList.length > 0) {
      registry.set(key, newList);
    } else {
      registry.delete(key);
    }
  },
  emit(key: string) {
    const event = new StorageEvent('storage', { key });
    registry.get(key)?.forEach((item) => item(event));
  },
  clear() {
    registry.clear();
  },
  size() {
    return registry.size;
  },
};
