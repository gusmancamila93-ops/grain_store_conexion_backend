import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

class MemoryStorage {
  #store = new Map();

  get length() {
    return this.#store.size;
  }

  clear() {
    this.#store.clear();
  }

  getItem(key) {
    return this.#store.has(key) ? this.#store.get(key) : null;
  }

  key(index) {
    return [...this.#store.keys()][index] ?? null;
  }

  removeItem(key) {
    this.#store.delete(key);
  }

  setItem(key, value) {
    this.#store.set(key, String(value));
  }
}

// Node's built-in `localStorage` global (unbacked by a file) shadows jsdom's
// implementation and lacks the Storage API, so it is replaced here.
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: new MemoryStorage(),
  writable: true,
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
