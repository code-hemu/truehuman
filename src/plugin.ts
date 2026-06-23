import { recaptchaPlugin } from "./detectors/grecaptcha.js"
import { turnstilePlugin } from "./detectors/turnstile.js"


export const detector = {
  grecaptcha: recaptchaPlugin,

  turnstile: turnstilePlugin,
}