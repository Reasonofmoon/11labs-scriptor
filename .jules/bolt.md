## 2024-05-14 - Optimize Visualizer canvas rendering and hydration
**Learning:** Math.random() in React component renders causes hydration mismatch between Next.js server and client. Also, creating new CanvasGradient objects inside requestAnimationFrame causes excessive memory allocation and garbage collection. Data values in the byte frequency array are bounded (0-255), which makes pre-calculation viable.
**Action:** Replace Math.random() with a constant array for idle state. Pre-calculate and cache CanvasGradients outside the drawing loop in a React useEffect.
