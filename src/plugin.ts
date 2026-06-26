import { recaptchaPlugin } from "./detectors/grecaptcha.js"
import { turnstilePlugin } from "./detectors/turnstile.js"
import { hardwarePlugin } from "./detectors/hardware.js"


export const detector = {
  grecaptcha: recaptchaPlugin,

  turnstile: turnstilePlugin,

  hardware: hardwarePlugin,
}