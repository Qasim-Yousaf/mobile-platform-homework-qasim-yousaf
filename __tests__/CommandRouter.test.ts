import {
  dispatch,
  confirmEntry,
  rejectEntry,
  getLog,
  clearLog,
} from '../src/agent/CommandRouter';

beforeEach(() => {
  clearLog();
});

describe('navigate validation', () => {
  it('rejects an unknown screen', () => {
    const entry = dispatch({ name: 'navigate', params: { screen: 'settings' } });
    expect(entry.status).toBe('rejected');
    expect(entry.reason).toMatch(/Invalid screen/);
  });

  it('rejects when screen param is missing', () => {
    const entry = dispatch({ name: 'navigate', params: {} });
    expect(entry.status).toBe('rejected');
    expect(entry.reason).toMatch(/Invalid screen/);
  });

  it('executes immediately for a valid screen', () => {
    const entry = dispatch({ name: 'navigate', params: { screen: 'explore' } });
    expect(entry.status).toBe('executed');
    expect(entry.reason).toBeUndefined();
  });
});

describe('applyExploreFilter validation', () => {
  it('rejects an unknown filter', () => {
    const entry = dispatch({ name: 'applyExploreFilter', params: { filter: 'Trending' } });
    expect(entry.status).toBe('rejected');
    expect(entry.reason).toMatch(/Invalid filter/);
  });

  it('rejects a valid filter with an unknown sort', () => {
    const entry = dispatch({ name: 'applyExploreFilter', params: { filter: 'Popular', sort: 'newest' } });
    expect(entry.status).toBe('rejected');
    expect(entry.reason).toMatch(/Invalid sort/);
  });

  it('executes with a valid filter and no sort', () => {
    const entry = dispatch({ name: 'applyExploreFilter', params: { filter: 'New' } });
    expect(entry.status).toBe('executed');
  });

  it('executes with a valid filter and valid sort', () => {
    const entry = dispatch({ name: 'applyExploreFilter', params: { filter: 'All', sort: 'A-Z' } });
    expect(entry.status).toBe('executed');
  });
});

describe('setPreference confirmation gate', () => {
  it('goes to pending_confirmation, never executed directly', () => {
    const entry = dispatch({ name: 'setPreference', params: { key: 'darkMode', value: true } });
    expect(entry.status).toBe('pending_confirmation');
  });

  it('rejects an unknown preference key', () => {
    const entry = dispatch({ name: 'setPreference', params: { key: 'fontSize', value: true } });
    expect(entry.status).toBe('rejected');
    expect(entry.reason).toMatch(/Invalid preference key/);
  });

  it('rejects when value is not a boolean', () => {
    const entry = dispatch({ name: 'setPreference', params: { key: 'notifications', value: 'yes' } });
    expect(entry.status).toBe('rejected');
    expect(entry.reason).toMatch(/boolean/);
  });
});

describe('confirmEntry', () => {
  it('moves a pending entry to executed', () => {
    const entry = dispatch({ name: 'setPreference', params: { key: 'darkMode', value: false } });
    expect(entry.status).toBe('pending_confirmation');

    const confirmed = confirmEntry(entry.id);
    expect(confirmed).not.toBeNull();
    expect(confirmed!.status).toBe('executed');
    expect(confirmed!.reason).toBeUndefined();
  });

  it('returns null for an unknown id', () => {
    expect(confirmEntry('nonexistent')).toBeNull();
  });

  it('returns null if entry is already executed', () => {
    const entry = dispatch({ name: 'navigate', params: { screen: 'home' } });
    expect(confirmEntry(entry.id)).toBeNull();
  });
});

describe('rejectEntry', () => {
  it('moves a pending entry to rejected with reason "User rejected"', () => {
    const entry = dispatch({ name: 'setPreference', params: { key: 'notifications', value: true } });
    expect(entry.status).toBe('pending_confirmation');

    const rejected = rejectEntry(entry.id);
    expect(rejected).not.toBeNull();
    expect(rejected!.status).toBe('rejected');
    expect(rejected!.reason).toBe('User rejected');
  });

  it('returns null for an unknown id', () => {
    expect(rejectEntry('nonexistent')).toBeNull();
  });
});

describe('getLog', () => {
  it('records every dispatched entry', () => {
    dispatch({ name: 'navigate', params: { screen: 'home' } });
    dispatch({ name: 'navigate', params: { screen: 'settings' } });
    dispatch({ name: 'setPreference', params: { key: 'darkMode', value: true } });

    const entries = getLog();
    expect(entries).toHaveLength(3);
    expect(entries[0].status).toBe('executed');
    expect(entries[1].status).toBe('rejected');
    expect(entries[2].status).toBe('pending_confirmation');
  });

  it('reflects confirm/reject mutations in the log', () => {
    const entry = dispatch({ name: 'setPreference', params: { key: 'darkMode', value: true } });
    confirmEntry(entry.id);

    const log = getLog();
    const found = log.find(e => e.id === entry.id);
    expect(found!.status).toBe('executed');
  });
});
