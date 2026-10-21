/**
 * Minimal browser environment stub so the detectors can run inside Node.js.
 * Only the surface the detectors touch is implemented; anything missing is
 * reported through the regular error-code path instead of throwing.
 */

const noop = () => {}

const LOCATION = {
  href: "https://example.test/index.html",
  protocol: "https:",
  host: "example.test",
  hostname: "example.test",
  origin: "https://example.test",
  pathname: "/index.html",
  search: "",
  hash: "",
}

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

function createElement(tag) {
  const element = {
    tagName: String(tag).toUpperCase(),
    style: {},
    childNodes: [],
    attributes: {},
    width: 300,
    height: 150,
    setAttribute(name, value) {
      this.attributes[name] = value
    },
    getAttribute(name) {
      return this.attributes[name] ?? null
    },
    getAttributeNames() {
      return Object.keys(this.attributes)
    },
    hasAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name)
    },
    appendChild(child) {
      this.childNodes.push(child)
      return child
    },
    removeChild(child) {
      return child
    },
    remove() {},
    getContext() {
      return null
    },
    toDataURL() {
      return "data:image/png;base64,"
    },
    getBoundingClientRect() {
      return { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
    },
    focus: noop,
    blur: noop,
    click: noop,
    contentWindow: null,
  }

  if (element.tagName === "SCRIPT") {
    queueMicrotask(() => element.onerror?.(new Error("script load failed")))
  }

  return element
}

function createStorage() {
  const store = new Map()

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
    removeItem(key) {
      store.delete(key)
    },
    clear() {
      store.clear()
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null
    },
    get length() {
      return store.size
    },
  }
}

function defineGlobal(name, value) {
  Object.defineProperty(globalThis, name, {
    value,
    writable: true,
    configurable: true,
  })
}

export function installDomStub() {
  const documentStub = {
    documentElement: createElement("html"),
    head: createElement("head"),
    body: createElement("body"),
    referrer: "",
    cookie: "",
    title: "truehuman test",
    visibilityState: "visible",
    hidden: false,
    readyState: "complete",
    location: LOCATION,
    createElement,
    getElementsByTagName: () => [],
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: noop,
    removeEventListener: noop,
    fonts: { check: () => true, ready: Promise.resolve() },
  }

  const navigatorStub = {
    userAgent: USER_AGENT,
    appVersion: "5.0 (Windows)",
    platform: "Win32",
    vendor: "Google Inc.",
    product: "Gecko",
    language: "en-US",
    languages: ["en-US", "en"],
    hardwareConcurrency: 8,
    deviceMemory: 8,
    maxTouchPoints: 0,
    webdriver: false,
    onLine: true,
    cookieEnabled: true,
    plugins: { length: 0, item: () => null, namedItem: () => null },
    mimeTypes: { length: 0, item: () => null, namedItem: () => null },
    permissions: { query: async () => ({ state: "granted", onchange: null }) },
    userAgentData: {
      brands: [{ brand: "Chromium", version: "126" }],
      mobile: false,
      platform: "Windows",
    },
  }

  defineGlobal("window", globalThis)
  defineGlobal("document", documentStub)
  defineGlobal("navigator", navigatorStub)
  defineGlobal("location", LOCATION)
  defineGlobal("screen", {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24,
    orientation: { type: "landscape-primary", angle: 0 },
  })
  defineGlobal("localStorage", createStorage())
  defineGlobal("sessionStorage", createStorage())
  defineGlobal("matchMedia", (media) => ({
    matches: false,
    media,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
  }))
  defineGlobal("CSS", { supports: () => true })
  defineGlobal("HTMLCanvasElement", class {
    toDataURL() {
      return "data:image/png;base64,"
    }
    toBlob(callback) {
      callback(null)
    }
  })
  defineGlobal("innerWidth", 1920)
  defineGlobal("innerHeight", 1080)
  defineGlobal("outerWidth", 1920)
  defineGlobal("outerHeight", 1080)
  defineGlobal("screenLeft", 0)
  defineGlobal("screenTop", 0)
  defineGlobal("devicePixelRatio", 1)
  defineGlobal("close", noop)
  defineGlobal("Notification", class {})
  defineGlobal("external", undefined)

  // Injected by the bundler at build time, referenced at runtime by the scorer.
  defineGlobal("__DEV__", true)
}

installDomStub()
