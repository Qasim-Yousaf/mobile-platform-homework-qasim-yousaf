import {
  CommandName,
  ALLOWED_SCREENS,
  ALLOWED_FILTERS,
  ALLOWED_SORTS,
  ALLOWED_PREFERENCE_KEYS,
  COMMANDS_REQUIRING_CONFIRMATION,
} from '../lib/constants';

export type { CommandName };

export type Command = {
  name: CommandName;
  params: Record<string, any>;
};

export type LogEntry = {
  id: string;
  command: CommandName;
  params: Record<string, any>;
  status: 'executed' | 'rejected' | 'pending_confirmation';
  reason?: string;
  timestamp: string;
};

function validate(command: Command): string | null {
  const { name, params } = command;

  if (name === 'navigate') {
    if (!params.screen || !ALLOWED_SCREENS.includes(params.screen)) {
      return `Invalid screen. Allowed: ${ALLOWED_SCREENS.join(', ')}`;
    }
  }

  if (name === 'applyExploreFilter') {
    if (!params.filter || !ALLOWED_FILTERS.includes(params.filter)) {
      return `Invalid filter. Allowed: ${ALLOWED_FILTERS.join(', ')}`;
    }
    if (params.sort && !ALLOWED_SORTS.includes(params.sort)) {
      return `Invalid sort. Allowed: ${ALLOWED_SORTS.join(', ')}`;
    }
  }

  if (name === 'setPreference') {
    if (!params.key || !ALLOWED_PREFERENCE_KEYS.includes(params.key)) {
      return `Invalid preference key. Allowed: ${ALLOWED_PREFERENCE_KEYS.join(', ')}`;
    }
    if (typeof params.value !== 'boolean') {
      return 'Preference value must be a boolean';
    }
  }

  if (name === 'showAlert') {
    if (!params.title || !params.message) {
      return 'showAlert requires title and message';
    }
  }

  if (name === 'exportAuditLog') {
    if (!params.log || typeof params.log !== 'string') {
      return 'exportAuditLog requires a log string';
    }
  }

  return null;
}

export function requiresConfirmation(name: CommandName): boolean {
  return (COMMANDS_REQUIRING_CONFIRMATION as readonly string[]).includes(name);
}

let log: LogEntry[] = [];

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export function dispatch(
  command: Command,
  onConfirm?: (entry: LogEntry) => void,
): LogEntry {
  const timestamp = new Date().toISOString();

  const validationError = validate(command);
  if (validationError) {
    const entry: LogEntry = {
      id: makeId(),
      command: command.name,
      params: command.params,
      status: 'rejected',
      reason: validationError,
      timestamp,
    };
    log.push(entry);
    return entry;
  }

  if (requiresConfirmation(command.name)) {
    const entry: LogEntry = {
      id: makeId(),
      command: command.name,
      params: command.params,
      status: 'pending_confirmation',
      timestamp,
    };
    log.push(entry);
    if (onConfirm) {
      onConfirm(entry);
    }
    return entry;
  }

  const entry: LogEntry = {
    id: makeId(),
    command: command.name,
    params: command.params,
    status: 'executed',
    timestamp,
  };
  log.push(entry);
  return entry;
}

export function confirmEntry(id: string): LogEntry | null {
  const entry = log.find(e => e.id === id);
  if (entry && entry.status === 'pending_confirmation') {
    entry.status = 'executed';
    return entry;
  }
  return null;
}

export function rejectEntry(id: string): LogEntry | null {
  const entry = log.find(e => e.id === id);
  if (entry && entry.status === 'pending_confirmation') {
    entry.status = 'rejected';
    entry.reason = 'User rejected';
    return entry;
  }
  return null;
}

export function getLog(): LogEntry[] {
  return [...log];
}

export function clearLog() {
  log = [];
}
