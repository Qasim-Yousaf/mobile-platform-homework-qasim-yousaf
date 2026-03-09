# AgentApp

A React Native app where an anchored agent chat controls the UI through a validated, auditable command pipeline.

## Setup

**iOS**
```bash
npm install
cd ios && pod install && cd ..
npx react-native run-ios
```
After `pod install`, open `ios/AgentApp.xcworkspace` in Xcode, verify `Ionicons.ttf` and `MaterialIcons.ttf` are in the target's *Copy Bundle Resources* phase, then build once from Xcode before using the CLI.

**Android**
```bash
npm install
npx react-native run-android
```

Requires Node >= 22, Xcode 16+, Android Studio with an emulator running.

## Architecture (TL;DR)

Three screens (Home, Explore, Profile) with a persistent agent bottom sheet. The agent parses natural language into structured commands, which pass through `CommandRouter`: allowlist check → schema validation → confirmation gate → execution → log entry. The agent never touches UI directly — it emits commands, the router decides what runs. Swift and Kotlin native modules handle audit log export to device storage.

## Key decisions

- Command Router is pure TS, no React — testable in isolation
- Dark mode is a user preference (AsyncStorage), not system theme
- Bottom tabs over stack nav — agent `navigate` jumps directly, no history needed
- `setPreference` always requires confirmation — other commands are non-destructive
- In-memory log — `exportAuditLog` writes to disk on demand
- Native audit module from scratch, no third-party FS library
- `src/lib/constants.ts` is the single source of truth for all allowed values
- AgentContext owns NLP and message state, separate from routing logic
- Props-based injection keeps screens decoupled from agent
- `react-native-vector-icons` (Ionicons) — TTFs in `Info.plist` (iOS) and `fonts.gradle` (Android)
- Rejected: AsyncStorage for log (overkill), NativeWind (unnecessary)

## AI disclosure

- **Tools used:** GitHub Copilot (VS Code), ChatGPT for sanity checks
- **Used for:** Boilerplate screen layout, StyleSheet values, Swift/Kotlin file write syntax
- **My decisions:** Command Router design, confirmation policy, context split, prop injection pattern, all architecture choices
- **My writing:** This README, decisions.md, CONTEXT.md — written directly, not generated

## Demo script

1. Launch app — Home screen with stat cards
2. Tap **Agent** button → flyout opens with welcome message
3. Type `what can you do?` → agent responds with capability list
4. Type `go to explore` → app navigates to Explore tab
5. Type `filter popular` → list filters to Popular items
6. Type `enable dark mode` → Proposed Action card appears
7. Tap **Confirm** → entire app switches to dark mode
8. Go to Profile → scroll down → Agent Activity Log shows all commands with status badges

## One meaningful test

`CommandRouter.test.ts` proves the command safety contract: invalid commands are rejected with a specific reason before execution, `setPreference` always goes to `pending_confirmation` (never executes directly), confirming a pending entry moves it to `executed`, and rejecting moves it to `rejected` with reason "User rejected". The test proves the UI can never bypass the confirmation gate.

## Next steps

- Persist command log across sessions (AsyncStorage or SQLite)
- Expand NLP with a lightweight LLM call for free-form input
- Add `showAlert` and `exportAuditLog` to confirmation policy
- Web portal with deep links (explore?filter=Popular, /?prompt=...)
- Command undo — reverse last executed state change

## Submission checklist

- [x] Repo named `mobile-platform-homework-qasim-yousaf` and default branch is `main`
- [x] README includes Setup commands for iOS + Android
- [x] README word count <= 500 (excluding commands/checkboxes)
- [x] `agent/CONTEXT.md` included
- [x] `artifacts/decisions.md` included (<= 400 words)
- [x] `artifacts/architecture.md` included
- [ ] `artifacts/demo-ios.mp4` and `artifacts/demo-android.mp4` included
- [x] One meaningful test included and described
- [x] AI disclosure included
