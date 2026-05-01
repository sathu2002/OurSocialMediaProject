import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { aiApi } from '../../api';
import { Card, Button, Loading } from '../../components';
import { colors, typography, spacing, commonStyles } from '../../styles/theme';

const AIChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      text: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await aiApi.chat(userMessage.text);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: response.data?.message || response.data?.response || "I couldn't process that request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.log('AI chat error:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Get Insights', action: () => handleQuickAction('Give me analytics insights') },
    { label: 'Task Summary', action: () => handleQuickAction('Show me my task summary') },
    { label: 'Trends', action: () => handleQuickAction('What are the current trends?') },
    { label: 'Help', action: () => handleQuickAction('What can you help me with?') },
  ];

  const handleQuickAction = (text) => {
    setInputText(text);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.type === 'user' ? styles.userMessage : styles.aiMessage]}>
      <View style={[styles.messageBubble, item.type === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.type === 'user' ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={commonStyles.content}>
          <Text style={commonStyles.title}>AI Assistant</Text>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.quickActionsLabel}>Quick Actions:</Text>
            <View style={styles.quickActionsRow}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickActionButton}
                  onPress={action.action}
                >
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <Loading message="AI is thinking..." />
            </View>
          )}

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={colors.gray500}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Button
              title="Send"
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
              size="md"
              style={styles.sendButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quickActionsContainer: {
    marginBottom: spacing.md,
  },
  quickActionsLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray400,
    marginBottom: spacing.xs,
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionButton: {
    backgroundColor: colors.navyLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  quickActionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
  },
  messagesList: {
    flex: 1,
    marginBottom: spacing.md,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  aiText: {
    color: colors.gray200,
  },
  timestamp: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray500,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray700,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.white,
    fontSize: typography.fontSizes.md,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  sendButton: {
    minWidth: 70,
  },
});

export default AIChatScreen;
