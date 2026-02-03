## 2026-02-03 - [Prop Instability Cascades]
**Learning:** In the `Home` component, passing inline function handlers to heavy children (`ScriptDisplay`, `AudioSequencer`) caused cascading re-renders on every keystroke (`inputText` state update). `React.memo` alone failed because props were new references.
**Action:** Always verify prop stability when optimizing with `React.memo`. Use `useCallback` for handlers passed to memoized components.
