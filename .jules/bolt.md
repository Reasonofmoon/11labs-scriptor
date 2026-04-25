## 2024-XX-XX - Initial Profiling
**Learning:** Understanding the codebase structure and performance goals.
**Action:** Focus on finding ONE small performance improvement that makes the application measurably faster or more efficient.

## 2024-XX-XX - Canvas Rendering Optimization & React.memo
**Learning:** Found significant overhead in repeatedly generating CanvasGradient objects during each requestAnimationFrame loop, and potential hydration issues due to Math.random() in idle states.
**Action:** Always pre-calculate and cache expensive Canvas API objects (like gradients) outside of the requestAnimationFrame loop, and avoid using impure functions like Math.random() for initial rendering to prevent Next.js hydration mismatches. Use React.memo for components with complex logic that receive stable props.
