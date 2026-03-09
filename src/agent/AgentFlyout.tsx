import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useAgent } from './AgentContext';
import { useTheme } from '../context/ThemeContext';

function formatProposedAction(command: string, params: Record<string, any>): string {
  if (command === 'setPreference') {
    const label = params.key === 'darkMode' ? 'Dark Mode' : 'Notifications';
    const state = params.value ? 'on' : 'off';
    return `Turn ${state} ${label}`;
  }
  if (command === 'navigate') {
    return `Go to ${params.screen}`;
  }
  if (command === 'applyExploreFilter') {
    return `Filter Explore by "${params.filter}"${params.sort ? `, sort ${params.sort}` : ''}`;
  }
  if (command === 'showAlert') {
    return `Show alert: "${params.title}"`;
  }
  if (command === 'exportAuditLog') {
    return 'Export the audit log to device storage';
  }
  return command;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const FLYOUT_HEIGHT = SCREEN_HEIGHT * 0.6;

export default function AgentFlyout({
  onNavigate,
  onApplyFilter,
  onSetPreference,
}: {
  onNavigate: (screen: string) => void;
  onApplyFilter: (filter: string, sort?: string) => void;
  onSetPreference: (key: string, value: boolean) => void;
}) {
  const { open, messages, closeFlyout, sendMessage, confirm, reject } = useAgent();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  if (!open) return null;

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendMessage(text, onNavigate, onApplyFilter, onSetPreference);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }

  const bg = dark ? '#1a1a1a' : '#fff';
  const textColor = dark ? '#fff' : '#000';
  const subColor = dark ? '#aaa' : '#666';
  const inputBg = dark ? '#2a2a2a' : '#f2f2f2';
  const userBubble = dark ? '#333' : '#e8e8e8';
  const agentBubble = dark ? '#0a84ff22' : '#007aff15';
  const borderColor = dark ? '#333' : '#e0e0e0';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlay}>
      <View style={[styles.sheet, { backgroundColor: bg, height: FLYOUT_HEIGHT }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Agent</Text>
          <TouchableOpacity onPress={closeFlyout}>
            <Text style={[styles.closeBtn, { color: subColor }]}>Close</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View>
              <View
                style={[
                  styles.bubble,
                  item.role === 'user'
                    ? [styles.userBubble, { backgroundColor: userBubble }]
                    : [styles.agentBubble, { backgroundColor: agentBubble }],
                ]}>
                <Text style={[styles.bubbleText, { color: textColor }]}>{item.text}</Text>
              </View>
              {item.proposedEntry && (
                <View style={[styles.proposedCard, { backgroundColor: dark ? '#222' : '#f9f9f9', borderColor }]}>
                  <Text style={[styles.proposedLabel, { color: subColor }]}>Proposed Action</Text>
                  <Text style={[styles.proposedCommand, { color: textColor }]}>
                    {formatProposedAction(item.proposedEntry.command, item.proposedEntry.params)}
                  </Text>
                  <View style={styles.proposedActions}>
                    <TouchableOpacity
                      style={[styles.confirmBtn, { backgroundColor: dark ? '#0a84ff' : '#007aff' }]}
                      onPress={() => confirm(item.proposedEntry!.id)}>
                      <Text style={styles.confirmBtnText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectBtn, { borderColor: dark ? '#555' : '#ccc' }]}
                      onPress={() => reject(item.proposedEntry!.id)}>
                      <Text style={[styles.rejectBtnText, { color: textColor }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        />
        <View style={[styles.inputRow, { borderTopColor: borderColor, backgroundColor: bg }]}>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
            placeholder="Ask the agent..."
            placeholderTextColor={subColor}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeBtn: {
    fontSize: 15,
  },
  messageList: {
    padding: 16,
    gap: 8,
  },
  bubble: {
    borderRadius: 12,
    padding: 12,
    maxWidth: '85%',
    marginBottom: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  agentBubble: {
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  proposedCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  proposedLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  proposedCommand: {
    fontSize: 13,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  proposedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  rejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  rejectBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#007aff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
