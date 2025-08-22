import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, Clock, User, Mail, Wifi, WifiOff, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../context/AuthContext';
import { useActivityTracker } from '../../hooks/useActivityTracker';

interface UserMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  read_at: string | null;
  created_at: string;
  related_property_id: string | null;
  conversation_id: string;
  sender_profile?: {
    first_name?: string;
    last_name?: string;
  };
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  messages: UserMessage[];
}

const MessagingCenter: React.FC = () => {
  const { user } = useAuth();
  const { trackActivity } = useActivityTracker();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (selectedConversation?.messages) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedConversation?.messages, scrollToBottom]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      const handleNewMessage = async (newMessage: UserMessage) => {
        console.log('Processing new message:', newMessage);
        
        if (newMessage.id.startsWith('temp-')) {
          return;
        }

        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('user_id', newMessage.sender_id)
          .maybeSingle();

        const messageWithProfile: UserMessage = {
          ...newMessage,
          sender_profile: profiles ? { 
            first_name: profiles.first_name || undefined, 
            last_name: profiles.last_name || undefined 
          } : { 
            first_name: 'Unknown', 
            last_name: 'User' 
          }
        };

        const otherUserId = newMessage.sender_id === user.id ? newMessage.recipient_id : newMessage.sender_id;
        
        setConversations(prev => {
          const updated = prev.map(conv => {
            const isThisConversation = conv.other_user_id === otherUserId;
            
            if (isThisConversation) {
              const messageExists = conv.messages.some(msg => msg.id === newMessage.id);
              if (messageExists) return conv;
              
              return {
                ...conv,
                messages: [...conv.messages, messageWithProfile],
                last_message: newMessage.message,
                last_message_at: newMessage.created_at,
                unread_count: newMessage.recipient_id === user.id ? conv.unread_count + 1 : conv.unread_count
              };
            }
            return conv;
          });
          
          const hasConversation = prev.some(conv => conv.other_user_id === otherUserId);
          
          if (!hasConversation && newMessage.recipient_id === user.id) {
            const senderProfile = messageWithProfile.sender_profile;
            const newConversation: Conversation = {
              id: otherUserId,
              other_user_id: otherUserId,
              other_user_name: `${senderProfile?.first_name || ''} ${senderProfile?.last_name || ''}`.trim() || 'Unknown User',
              last_message: newMessage.message,
              last_message_at: newMessage.created_at,
              unread_count: 1,
              messages: [messageWithProfile]
            };
            return [newConversation, ...updated];
          }
          
          return updated;
        });
        
        setSelectedConversation(prev => {
          if (!prev) return prev;
          
          if (prev.other_user_id === otherUserId) {
            const messageExists = prev.messages.some(msg => msg.id === newMessage.id);
            if (messageExists) return prev;
            
            const updatedConversation = {
              ...prev,
              messages: [...prev.messages, messageWithProfile],
              last_message: newMessage.message,
              last_message_at: newMessage.created_at
            };
            
            setTimeout(scrollToBottom, 100);
            
            return updatedConversation;
          }
          return prev;
        });
      };

      const recipientChannel = supabase
        .channel('recipient-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_messages',
            filter: `recipient_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('New message received as recipient:', payload.new);
            await handleNewMessage(payload.new as UserMessage);
          }
        )
        .on('system', {}, (payload) => {
          if (payload.type === 'connected') {
            setIsConnected(true);
          } else if (payload.type === 'error') {
            setIsConnected(false);
          }
        })
        .subscribe();

      const senderChannel = supabase
        .channel('sender-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_messages',
            filter: `sender_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('New message sent by user:', payload.new);
            await handleNewMessage(payload.new as UserMessage);
          }
        )
        .on('system', {}, (payload) => {
          if (payload.type === 'connected') {
            setIsConnected(true);
          } else if (payload.type === 'error') {
            setIsConnected(false);
          }
        })
        .subscribe();

      const readStatusChannel = supabase
        .channel('read-status-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_messages',
            filter: `sender_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Message read status updated for sender:', payload);
            console.log('Payload details:', {
              old: payload.old,
              new: payload.new,
              eventType: payload.eventType
            });
            const updatedMessage = payload.new as UserMessage;
            
            if (updatedMessage && updatedMessage.read_at) {
              console.log('Updating message read status in UI:', updatedMessage.id);
              setSelectedConversation(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  messages: prev.messages.map(msg => 
                    msg.id === updatedMessage.id 
                      ? { ...msg, read_at: updatedMessage.read_at, status: 'read' }
                      : msg
                  )
                };
              });
              
              setConversations(prev => prev.map(conv => ({
                ...conv,
                messages: conv.messages.map(msg => 
                  msg.id === updatedMessage.id 
                    ? { ...msg, read_at: updatedMessage.read_at, status: 'read' }
                    : msg
                )
              })));
            }
          }
        )
        .on('system', {}, (payload) => {
          if (payload.type === 'connected') {
            setIsConnected(true);
          } else if (payload.type === 'error') {
            setIsConnected(false);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(recipientChannel);
        supabase.removeChannel(senderChannel);
        supabase.removeChannel(readStatusChannel);
      };
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      console.log('Fetching conversations for user:', user.id);
      
      const { data: messages, error } = await supabase
        .from('user_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      console.log('Fetched messages:', messages?.length || 0);

      if (!messages || messages.length === 0) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      const userIds = Array.from(new Set(
        messages.map(msg => msg.sender_id === user.id ? msg.recipient_id : msg.sender_id)
      ));

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const conversationMap = new Map<string, Conversation>();

      messages?.forEach((message: any) => {
        const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
        const otherUserProfile = profileMap.get(otherUserId);
        
        const otherUserName = `${otherUserProfile?.first_name || ''} ${otherUserProfile?.last_name || ''}`.trim() || 'Unknown User';

        if (!conversationMap.has(otherUserId)) {
          const lastMessageFromOther = message.sender_id !== user.id ? message.message : '';
          
          conversationMap.set(otherUserId, {
            id: otherUserId,
            other_user_id: otherUserId,
            other_user_name: otherUserName,
            last_message: lastMessageFromOther,
            last_message_at: message.created_at,
            unread_count: 0,
            messages: []
          });
        }

        const conversation = conversationMap.get(otherUserId)!;
        
        if (message.sender_id !== user.id && new Date(message.created_at) > new Date(conversation.last_message_at)) {
          conversation.last_message = message.message;
          conversation.last_message_at = message.created_at;
        }
        
        const userMessage: UserMessage = {
          id: message.id,
          sender_id: message.sender_id,
          recipient_id: message.recipient_id,
          subject: message.subject,
          message: message.message,
          read_at: message.read_at,
          created_at: message.created_at,
          related_property_id: message.related_property_id,
          conversation_id: message.conversation_id,
          sender_profile: otherUserProfile ? {
            first_name: otherUserProfile.first_name || undefined,
            last_name: otherUserProfile.last_name || undefined
          } : undefined
        };
        conversation.messages.push(userMessage);
        
        if (message.recipient_id === user.id && !message.read_at) {
          conversation.unread_count++;
        }
      });

      const sortedConversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

      setConversations(sortedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ConversationCard: React.FC<{ conversation: Conversation }> = ({ conversation }) => (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
        selectedConversation?.id === conversation.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => selectConversation(conversation)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{conversation.other_user_name}</h3>
          <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
        </div>
        {conversation.unread_count > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {conversation.unread_count}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <Clock size={14} className="mr-1" />
          <span>{new Date(conversation.last_message_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center">
          <MessageSquare size={14} className="mr-1" />
          <span>{conversation.messages.length} messages</span>
        </div>
      </div>
    </div>
  );

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await markMessagesAsRead(conversation.other_user_id);
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    if (!user) return;

    try {
      console.log('Marking messages as read for conversation with:', otherUserId);
      
      // Get all unread messages from this sender first
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('user_messages')
        .select('id')
        .eq('sender_id', otherUserId)
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (fetchError) {
        console.error('Error fetching unread messages:', fetchError);
        return;
      }

      if (!unreadMessages || unreadMessages.length === 0) {
        console.log('No unread messages to mark as read');
        return;
      }

      console.log('Found unread messages to mark as read:', unreadMessages.length);

      // Update all unread messages from this sender
      const { error } = await supabase
        .from('user_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) {
        console.error('Error marking messages as read:', error);
        throw error;
      }

      console.log('Successfully marked messages as read, real-time should trigger for sender');

      // Update local state immediately for better UX
      setConversations(prev => prev.map(conv => 
        conv.id === otherUserId 
          ? { ...conv, unread_count: 0 }
          : conv
      ));

      setSelectedConversation(prev => {
        if (!prev || prev.other_user_id !== otherUserId) return prev;
        return {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.sender_id === otherUserId && msg.recipient_id === user.id && !msg.read_at
              ? { ...msg, read_at: new Date().toISOString(), status: 'read' }
              : msg
          ),
          unread_count: 0
        };
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };


  const getMessageStatus = (message: UserMessage, isFromUser: boolean) => {
    if (!isFromUser) return null;
    
    if (message.status === 'sending') {
      return <Clock size={12} className="text-blue-300" />;
    } else if (message.read_at) {
      return <CheckCheck size={12} className="text-blue-400" />;
    } else {
      return <Check size={12} className="text-blue-300" />;
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleString([], { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const MessageBubble: React.FC<{ message: UserMessage; isFromUser: boolean }> = ({ message, isFromUser }) => (
    <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isFromUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm">{message.message}</p>
        <div className={`flex items-center justify-between mt-2 ${isFromUser ? 'text-blue-100' : 'text-gray-500'}`}>
          <span className="text-xs">
            {formatMessageTime(message.created_at)}
          </span>
          <div className="flex items-center ml-2">
            {getMessageStatus(message, isFromUser)}
            {!isFromUser && !message.read_at && (
              <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || !user || isSending) return;

    const messageToSend = messageText.trim();
    const currentTime = new Date().toISOString();
    setIsSending(true);
    
    const optimisticMessage: UserMessage = {
      id: `temp-${Date.now()}-${Math.random()}`,
      sender_id: user.id,
      recipient_id: selectedConversation.other_user_id,
      subject: 'Reply',
      message: messageToSend,
      read_at: null,
      created_at: currentTime,
      conversation_id: selectedConversation.messages[0]?.conversation_id || crypto.randomUUID(),
      related_property_id: null,
      status: 'sending',
      sender_profile: {
        first_name: user.user_metadata?.first_name || 'You',
        last_name: user.user_metadata?.last_name || ''
      }
    };

    const updatedSelectedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, optimisticMessage],
      last_message: messageToSend,
      last_message_at: currentTime
    };
    
    setSelectedConversation(updatedSelectedConversation);
    
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? {
            ...conv,
            messages: [...conv.messages, optimisticMessage],
            last_message: messageToSend,
            last_message_at: currentTime
          }
        : conv
    ));

    setMessageText('');

    try {
      const newMessage = {
        sender_id: user.id,
        recipient_id: selectedConversation.other_user_id,
        subject: 'Reply',
        message: messageToSend,
        conversation_id: selectedConversation.messages[0]?.conversation_id || crypto.randomUUID()
      };

      const { data, error } = await supabase
        .from('user_messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;

      const realMessage: UserMessage = {
        ...data,
        status: 'sent',
        sender_profile: {
          first_name: user.user_metadata?.first_name || 'You',
          last_name: user.user_metadata?.last_name || ''
        }
      };

      trackActivity('message_sent', {
        recipient: selectedConversation.other_user_name,
        message_content: messageToSend.substring(0, 50) + (messageToSend.length > 50 ? '...' : '')
      });

      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === optimisticMessage.id ? realMessage : msg
        )
      } : null);

      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === optimisticMessage.id ? realMessage : msg
              )
            }
          : conv
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== optimisticMessage.id),
        last_message: prev.messages[prev.messages.length - 2]?.message || '',
        last_message_at: prev.messages[prev.messages.length - 2]?.created_at || prev.last_message_at
      } : null);

      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? {
              ...conv,
              messages: conv.messages.filter(msg => msg.id !== optimisticMessage.id),
              last_message: conv.messages[conv.messages.length - 2]?.message || conv.last_message,
              last_message_at: conv.messages[conv.messages.length - 2]?.created_at || conv.last_message_at
            }
          : conv
      ));
      
      setMessageText(messageToSend);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
          <div className="bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="lg:col-span-2 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="text-sm text-gray-600">
            {conversations.length} conversations
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <div className="space-y-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={24} className="text-gray-400" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h4>
              <p className="text-gray-600 text-sm">
                Contact property agents to start conversations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <ConversationCard key={conversation.id} conversation={conversation} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col h-full max-h-[600px]">
          {selectedConversation ? (
            <>
              <div className="bg-white border border-gray-200 rounded-t-lg p-4 border-b flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedConversation.other_user_name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <User size={14} className="mr-1" />
                      <span>Direct message</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => markMessagesAsRead(selectedConversation.other_user_id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Mark as read"
                    >
                      <Mail size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div 
                ref={chatContainerRef} 
                className="flex-1 bg-white border-l border-r border-gray-200 p-4 overflow-y-auto min-h-0"
              >
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  <>
                    {selectedConversation.messages
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message) => (
                        <MessageBubble 
                          key={message.id} 
                          message={message} 
                          isFromUser={message.sender_id === user?.id}
                        />
                      ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-b-lg p-4 border-t flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;
