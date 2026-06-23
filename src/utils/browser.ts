const ua = navigator.userAgent.toLowerCase()

export const isGecko = /gecko\//.test(ua) && !/like gecko/i.test(ua)
export const isAndroid = /android/.test(ua)
export const isWebKit = /applewebkit/.test(ua) && !/chrome/i.test(ua)
