import { checkDocumentIntegrity } from "./document.js"
import { checkNavigatorIntegrity } from "./navigator.js"
import { checkScreenIntegrity } from "./screen.js"
import { checkDateIntegrity } from "./date.js"
import { checkIframeElementIntegrity } from "./iframe-element.js"
import { checkPrototypeIntegrity } from "./prototype.js"

export function runIntegrityChecks(
  iframe: HTMLIFrameElement | null,
  comparisons: boolean[],
  errors: number[],
): (string | number)[] {
  const codes: (string | number)[] = []

  try {
    codes.push(...checkDocumentIntegrity(iframe, comparisons))
  } catch {
    errors.push(30)
  }

  try {
    codes.push(...checkNavigatorIntegrity(iframe, comparisons))
  } catch {
    errors.push(31)
  }

  try {
    codes.push(...checkScreenIntegrity())
  } catch {
    errors.push(32)
  }

  try {
    codes.push(...checkDateIntegrity(iframe, comparisons))
  } catch {
    errors.push(33)
  }

  try {
    codes.push(...checkIframeElementIntegrity(iframe))
  } catch {
    errors.push(34)
  }

  try {
    checkPrototypeIntegrity(iframe, comparisons, codes)
  } catch {
    errors.push(35)
  }

  return codes
}
