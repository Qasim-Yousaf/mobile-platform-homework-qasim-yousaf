# Architecture

## Overview

```
App.tsx
├── ThemeProvider          (dark mode state + AsyncStorage)
└── AgentProvider          (flyout state + message list + command dispatch)
    └── NavigationContainer
        ├── HomeScreen
        ├── ExploreScreen  (accepts externalFilter prop from App)
        ├── ProfileScreen  (accepts pendingPref prop + shows Activity Log)
        └── AgentFlyout    (floating bottom sheet, always rendered above tabs)
```

## Data flow

```
User types message
      │
      ▼
AgentContext.sendMessage()
      │
      ├── parseCommand()         natural language → Command object
      │
      ▼
CommandRouter.dispatch()
      │
      ├── validate()             schema + allowlist check
      │         └── rejected?   → log entry (rejected) → agent replies with reason
      │
      ├── requiresConfirmation?  → log entry (pending_confirmation)
      │         └── AgentFlyout shows Proposed Action card
      │                   ├── Confirm → confirmEntry() → execute → log (executed)
      │                   └── Reject  → rejectEntry()  → log (rejected)
      │
      └── execute immediately    → log entry (executed) → UI update via props
```

## Key files

| File | Role |
|---|---|
| `src/agent/CommandRouter.ts` | Allowlist, validation, confirmation, log |
| `src/agent/AgentContext.tsx` | NLP parsing, message state, command dispatch |
| `src/agent/AgentFlyout.tsx` | Chat UI, proposed action cards |
| `src/context/ThemeContext.tsx` | Dark mode state shared across all screens |
| `src/lib/constants.ts` | All allowed values as typed constants |
| `src/lib/AuditLogModule.ts` | JS bridge to native filesystem module |
| `ios/AgentApp/AuditLogModule.swift` | Native iOS file write (FileManager) |
| `android/.../AuditLogModule.kt` | Native Android file write (File API) |
