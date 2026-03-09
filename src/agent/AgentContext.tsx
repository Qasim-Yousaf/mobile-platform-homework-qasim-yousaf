import React, { createContext, useContext, useState, useRef } from 'react';
import { dispatch, confirmEntry, rejectEntry, getLog, LogEntry, Command } from './CommandRouter';

type Message = {
  id: string;
  role: 'user' | 'agent';
  text: string;
  proposedEntry?: LogEntry;
};

type AgentContextType = {
  open: boolean;
  messages: Message[];
  openFlyout: () => void;
  closeFlyout: () => void;
  sendMessage: (text: string, nav: (screen: string) => void, applyFilter: (filter: string, sort?: string) => void, setPref: (key: string, value: boolean) => void) => void;
  confirm: (id: string) => void;
  reject: (id: string) => void;
};

const AgentContext = createContext<AgentContextType>({
  open: false,
  messages: [],
  openFlyout: () => {},
  closeFlyout: () => {},
  sendMessage: () => {},
  confirm: () => {},
  reject: () => {},
});

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function parseCommand(text: string): Command | null {
  const t = text.toLowerCase().trim();

  if (t.includes('go to home') || t.includes('navigate to home') || t.includes('open home')) {
    return { name: 'navigate', params: { screen: 'home' } };
  }
  if (t.includes('go to explore') || t.includes('navigate to explore') || t.includes('open explore')) {
    return { name: 'navigate', params: { screen: 'explore' } };
  }
  if (t.includes('go to profile') || t.includes('navigate to profile') || t.includes('open profile')) {
    return { name: 'navigate', params: { screen: 'profile' } };
  }
  if (t.includes('filter popular') || t.includes('show popular')) {
    return { name: 'applyExploreFilter', params: { filter: 'Popular' } };
  }
  if (t.includes('filter new') || t.includes('show new')) {
    return { name: 'applyExploreFilter', params: { filter: 'New' } };
  }
  if (t.includes('filter all') || t.includes('show all')) {
    return { name: 'applyExploreFilter', params: { filter: 'All' } };
  }
  if (t.includes('sort a-z') || t.includes('sort ascending')) {
    return { name: 'applyExploreFilter', params: { filter: 'All', sort: 'A-Z' } };
  }
  if (t.includes('sort z-a') || t.includes('sort descending')) {
    return { name: 'applyExploreFilter', params: { filter: 'All', sort: 'Z-A' } };
  }
  if (t.includes('turn on dark mode') || t.includes('enable dark mode')) {
    return { name: 'setPreference', params: { key: 'darkMode', value: true } };
  }
  if (t.includes('turn off dark mode') || t.includes('disable dark mode')) {
    return { name: 'setPreference', params: { key: 'darkMode', value: false } };
  }
  if (t.includes('turn on notifications') || t.includes('enable notifications')) {
    return { name: 'setPreference', params: { key: 'notifications', value: true } };
  }
  if (t.includes('turn off notifications') || t.includes('disable notifications')) {
    return { name: 'setPreference', params: { key: 'notifications', value: false } };
  }
  if (t.includes('close') && t.includes('chat')) {
    return { name: 'closeFlyout', params: {} };
  }
  if (t.includes('export') && t.includes('log')) {
    const log = JSON.stringify(getLog(), null, 2);
    return { name: 'exportAuditLog', params: { log } };
  }
  return null;
}

function getHelpResponse(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('what can you do') || t.includes('help') || t.includes('commands')) {
    return 'I can navigate between screens, filter and sort the Explore list, toggle your preferences, show alerts, and export the audit log. Try: "go to explore", "filter popular", "enable dark mode".';
  }
  if (t.includes('where') && t.includes('profile')) {
    return 'Profile is the third tab. I can take you there — just say "go to profile".';
  }
  if (t.includes('where') && t.includes('explore')) {
    return 'Explore is the second tab with a filterable list. Say "go to explore" and I can also apply filters for you.';
  }
  if (t.includes('log') || t.includes('history') || t.includes('audit')) {
    return 'The Agent Activity Log is visible in the Profile screen. Say "export log" to save it to your device.';
  }
  if (t.includes('filter') || t.includes('sort')) {
    return 'I can filter the Explore list by All, Popular, or New. I can also sort A-Z or Z-A. Try: "filter popular" or "sort z-a".';
  }
  if (t.includes('preference') || t.includes('setting') || t.includes('dark') || t.includes('notification')) {
    return 'I can toggle Dark Mode and Notifications in your Profile. Say "enable dark mode" or "disable notifications". These require your confirmation.';
  }
  return 'I\'m not sure about that. Try asking "what can you do?" to see all available actions.';
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      text: 'Hi! I can help you navigate the app and control the UI. Ask me what I can do.',
    },
  ]);

  const pendingCallbacks = useRef<Record<string, {
    nav: (screen: string) => void;
    applyFilter: (filter: string, sort?: string) => void;
    setPref: (key: string, value: boolean) => void;
  }>>({});

  function addMessage(msg: Omit<Message, 'id'>) {
    setMessages(prev => [...prev, { ...msg, id: makeId() }]);
  }

  function openFlyout() {
    setOpen(true);
  }

  function closeFlyout() {
    setOpen(false);
  }

  function sendMessage(
    text: string,
    nav: (screen: string) => void,
    applyFilter: (filter: string, sort?: string) => void,
    setPref: (key: string, value: boolean) => void,
  ) {
    addMessage({ role: 'user', text });

    const command = parseCommand(text);

    if (!command) {
      addMessage({ role: 'agent', text: getHelpResponse(text) });
      return;
    }

    const entry = dispatch(command, (pendingEntry) => {
      pendingCallbacks.current[pendingEntry.id] = { nav, applyFilter, setPref };
    });

    if (entry.status === 'rejected') {
      addMessage({ role: 'agent', text: `Command rejected: ${entry.reason}` });
      return;
    }

    if (entry.status === 'pending_confirmation') {
      addMessage({
        role: 'agent',
        text: `I'd like to set "${entry.params.key}" to ${entry.params.value}. Please confirm or reject below.`,
        proposedEntry: entry,
      });
      return;
    }

    executeCommand(command, nav, applyFilter, setPref);
    addMessage({ role: 'agent', text: `Done: ${command.name}` });

    if (command.name === 'closeFlyout') {
      setOpen(false);
    }
  }

  function executeCommand(
    command: Command,
    nav: (screen: string) => void,
    applyFilter: (filter: string, sort?: string) => void,
    setPref: (key: string, value: boolean) => void,
  ) {
    if (command.name === 'navigate') {
      nav(command.params.screen);
    }
    if (command.name === 'applyExploreFilter') {
      nav('explore');
      applyFilter(command.params.filter, command.params.sort);
    }
    if (command.name === 'setPreference') {
      setPref(command.params.key, command.params.value);
    }
  }

  function confirm(id: string) {
    const entry = confirmEntry(id);
    if (!entry) return;
    const cbs = pendingCallbacks.current[id];
    if (cbs) {
      executeCommand(
        { name: entry.command, params: entry.params },
        cbs.nav,
        cbs.applyFilter,
        cbs.setPref,
      );
      delete pendingCallbacks.current[id];
    }
    setMessages(prev =>
      prev.map(m =>
        m.proposedEntry?.id === id
          ? { ...m, text: `Confirmed: set "${entry.params.key}" to ${entry.params.value}`, proposedEntry: undefined }
          : m,
      ),
    );
  }

  function reject(id: string) {
    const entry = rejectEntry(id);
    setMessages(prev =>
      prev.map(m =>
        m.proposedEntry?.id === id
          ? { ...m, text: `Rejected: set "${entry?.params.key}"`, proposedEntry: undefined }
          : m,
      ),
    );
  }

  return (
    <AgentContext.Provider value={{ open, messages, openFlyout, closeFlyout, sendMessage, confirm, reject }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  return useContext(AgentContext);
}
