## 2026-05-02 - Pre-calculated CanvasGradients and constant arrays
**Learning:** Recreating objects like CanvasGradient inside a render loop affects performance and using impure function Math.random() in render cause errors.
**Action:** Use pre-calculated array caches initialized outside requestAnimationFrame loop and constant arrays instead.
