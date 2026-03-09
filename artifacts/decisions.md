# Decisions

## Decisions made

**1. Command Router as pure logic module, no UI coupling**
`CommandRouter.ts` is a plain TS module with no React imports. It owns the allowlist, validation, confirmation state, and log. This means it can be tested in isolation with Jest and the agent UI is just a consumer — swapping the UI layer doesn't touch the command contract.

**2. ThemeContext over system `useColorScheme`**
Dark mode is driven by a user preference stored in AsyncStorage, not the system setting. The Profile toggle explicitly controls it. This matches the requirement for a "persistent preference" and means the app respects the user's in-app choice regardless of system theme.

**3. Native module written from scratch in Swift + Kotlin**
`AuditLogModule` uses `FileManager` (Swift) and `File.writeText` (Kotlin) directly. No third-party filesystem library. This keeps the dependency surface small and demonstrates actual native bridging rather than wrapping an existing JS abstraction.

## Alternatives rejected

**4. React Navigation Stack instead of Bottom Tabs**
A stack navigator would have added back-button semantics that don't fit a flat 3-screen app. Bottom tabs make all screens always accessible, which matches how the agent's `navigate` command works — it jumps directly to any screen without a history stack.

**5. Persisting command log to AsyncStorage**
Storing the log in AsyncStorage would survive app restarts but adds async complexity to every dispatch. For this scope the in-memory log is sufficient — it resets on restart, and the `exportAuditLog` command writes it to disk when needed. Persistence can be added later without changing the Command Router interface.
