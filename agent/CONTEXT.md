# Agent Context

## What the app is

AgentApp is a React Native app with three screens (Home, Explore, Profile) controlled by a persistent agent chat. The agent understands natural language, maps it to structured commands, and routes them through a validation + confirmation pipeline before any UI state changes.

## What the agent can do

- Navigate to any screen: Home, Explore, Profile
- Open or close the agent flyout
- Apply a filter (All / Popular / New) and sort (A-Z / Z-A) on the Explore screen
- Toggle user preferences: darkMode, notifications
- Show an alert with a custom title and message
- Export the agent activity log to device storage

## What the agent cannot do

- Execute commands not on the allowlist
- Change preferences without user confirmation
- Access any data outside the app
- Make network requests
- Manipulate UI directly — all actions go through the Command Router

## Command contract

| Command | Params | Requires Confirmation |
|---|---|---|
| navigate | screen: home \| explore \| profile | No |
| openFlyout | — | No |
| closeFlyout | — | No |
| applyExploreFilter | filter: All \| Popular \| New, sort?: A-Z \| Z-A | No |
| setPreference | key: darkMode \| notifications, value: boolean | Yes |
| showAlert | title: string, message: string | No |
| exportAuditLog | log: string | No |

## Confirmation policy

`setPreference` always requires explicit user confirmation via the Proposed Action card. The agent emits a `pending_confirmation` log entry and waits. Confirming executes and logs `executed`. Rejecting logs `rejected` with reason "User rejected". No other commands currently require confirmation, but `exportAuditLog` and `showAlert` are candidates for future confirmation gating.

## Golden paths

**1. Navigate and filter**
> User: "go to explore"
> Agent: navigates to Explore tab, replies "Done: navigate"
> User: "filter popular"
> Agent: applies Popular filter, replies "Done: applyExploreFilter"

**2. Preference change with confirmation**
> User: "enable dark mode"
> Agent: shows Proposed Action card — "Turn on Dark Mode"
> User taps Confirm
> Agent: applies dark mode across all screens, logs as executed

**3. Rejected invalid command**
> User: "go to settings"
> Agent: replies "Command rejected: Invalid screen. Allowed: home, explore, profile"
> Log entry created with status: rejected
