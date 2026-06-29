# Scoring

Exprify's bot detection engine produces a numeric risk score for every evaluation session. This score is derived from a combination of emitted error codes, environmental signals, and cross-component activity, and is then mapped to a human-readable verdict indicating the likelihood that the current visitor is a bot.

## Risk Score

The risk score is a single integer in the range **0 to 100** that summarizes the cumulative suspicion level detected during a session. A score of 0 means no suspicious signals were found at all, while a score of 100 means the maximum possible level of suspicion has been reached.

The score is calculated by aggregating contributions from multiple independent penalty systems, each of which targets a different category of anomalous behavior.

### Base Calculation

The full risk score formula combines all active penalties and clamps the final result to a maximum of 100:

```
riskScore = sum(code.risk for each code)
          + iframeComparisonPenalty (min(trueCount * 15, 30))
          + errorPenalty (min(errorCount * 8, 20))
          + crossComponentPenalty ((activeComponents - 1) * 5)


riskScore = min(riskScore, 100)
```


Each term in this formula is independently calculated and then summed before the final cap is applied. This means that multiple moderate signals can combine to push a session into a high-risk verdict even if no single signal is conclusive on its own.

## Verdict Thresholds

Once the final risk score is calculated, it is mapped to a verdict and a severity level. These thresholds define the four possible outcomes of a scoring session:

| Score Range | Verdict | Severity Level |
|-------------|---------|----------------|
| 0 – 15 | `human` | low |
| 16 – 40 | `suspicious` | medium |
| 41 – 70 | `bot` | high |
| 71 – 100 | `bot` | critical |

- **human / low:** No significant signals detected. The session displays normal human browsing behavior.
- **suspicious / medium:** Some anomalous signals were found, but not enough to conclusively classify the session as automated. These sessions may warrant closer monitoring or a secondary challenge.
- **bot / high:** Multiple strong signals indicate that the session is very likely automated. Protective action is recommended.
- **bot / critical:** The session exhibits extreme or highly concentrated bot signals. Immediate blocking or rate limiting is strongly advised.

## Confidence

The confidence value represents how certain the engine is that the current session belongs to a **real human user**. It is derived directly from the risk score using a simple inversion:
confidence = 100 - riskScore

A session with a risk score of 10 produces a confidence of 90, meaning there is high certainty the visitor is human. Conversely, a risk score of 85 produces a confidence of only 15, indicating very low certainty in the human verdict.

Confidence is intended to be used alongside the verdict when making downstream decisions. For example, a `suspicious` verdict with a confidence of 70 may be treated differently from one with a confidence of 25, even though both fall in the same verdict band.

## Cross-Component Penalty

The cross-component penalty increases the risk score whenever suspicious signals are detected across more than one detection domain simultaneously. The reasoning is that a single anomaly in one area could be coincidental or environment-specific, but correlated anomalies across multiple independent components are much harder to explain as false positives.

```
if (activeComponents > 1) {
    crossComponentPenalty = (activeComponents - 1) * 5
}
```

For example, if signals are active across 4 detection components, the penalty is `(4 - 1) * 5 = 15` points. There is no hard cap on this penalty, so sessions that trigger many detection domains simultaneously accumulate significant additional risk.

## Iframe Comparison Penalty

The iframe comparison penalty targets one of the most reliable bot detection techniques: comparing JavaScript environment properties between the **main browsing context** and a **sandboxed iframe**. In a genuine browser, most properties are consistent between the two contexts. Headless browsers, automation frameworks, and spoofed environments frequently produce discrepancies.

Each property comparison that returns a different value between the main window and the sandboxed iframe contributes 15 points to the penalty, with the total capped at 30:
iframeComparisonPenalty = min(trueComparisonCount * 15, 30)

This means even a single discrepancy adds a meaningful 15-point penalty, and two or more mismatches hit the cap immediately. The cap exists to prevent this single signal from dominating the final score on its own.

## Error Penalty

The error penalty accounts for detectors that fail to execute cleanly during a session. In a standard browser environment, all detectors should run without throwing exceptions. When a detector throws an error, it typically indicates that the JavaScript environment has been tampered with, certain APIs have been removed or overridden, or the browser is running in a restricted or synthetic context.

Each detector that throws an unhandled error during execution adds 8 points, with the total capped at 20:

```
errorPenalty = min(errorCount * 8, 20)
```

One failed detector adds 8 points, two add 16, and three or more hit the cap of 20. This cap ensures that a single misconfigured or unsupported browser does not get unfairly penalized beyond a reasonable ceiling for this signal type alone.

