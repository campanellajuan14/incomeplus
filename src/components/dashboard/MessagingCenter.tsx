import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, User, Mail } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../context/AuthContext';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
      
      // Handle new messages with better real-time support
      const handleNewMessage = async (newMessage: UserMessage) => {
        console.log('Processing new message:', newMessage);
        
        // Skip if this is an optimistic message (temporary ID)
        if (newMessage.id.startsWith('temp-')) {
          return;
        }

        // Load sender profile
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

        // Determine the other user in this conversation
        const otherUserId = newMessage.sender_id === user.id ? newMessage.recipient_id : newMessage.sender_id;
        
        // Update conversations state with new message in real-time
        setConversations(prev => {
          const updated = prev.map(conv => {
            // Check if this conversation involves the other user
            const isThisConversation = conv.other_user_id === otherUserId;
            
            if (isThisConversation) {
              // Check if message already exists to prevent duplicates
              const messageExists = conv.messages.some(msg => msg.id === newMessage.id);
              if (messageExists) return conv;
              
              return {
                ...conv,
                messages: [...conv.messages, messageWithProfile],
                last_message: newMessage.message,
                last_message_at: newMessage.created_at,
                // Only increment unread count if current user is recipient
                unread_count: newMessage.recipient_id === user.id ? conv.unread_count + 1 : conv.unread_count
              };
            }
            return conv;
          });
          
          // If this is a new conversation and current user is recipient, create a new one
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
        
        // Update selected conversation if it's the active one
        setSelectedConversation(prev => {
          if (!prev) return prev;
          
          if (prev.other_user_id === otherUserId) {
            // Check if message already exists to prevent duplicates
            const messageExists = prev.messages.some(msg => msg.id === newMessage.id);
            if (messageExists) return prev;
            
            return {
              ...prev,
              messages: [...prev.messages, messageWithProfile],
              last_message: newMessage.message,
              last_message_at: newMessage.created_at
            };
          }
          return prev;
        });
      };

      // Set up real-time subscription for messages where user is recipient
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
        .subscribe();

      // Set up real-time subscription for messages where user is sender
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
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_messages',
            filter: `recipient_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Message updated:', payload.new);
            // Refresh conversations when a message is updated (e.g., marked as read)
            fetchConversations();
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(recipientChannel);
        supabase.removeChannel(senderChannel);
      };
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      console.log('Fetching conversations for user:', user.id);
      
      // Fetch messages first
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

      // Get unique user IDs to fetch profiles
      const userIds = Array.from(new Set(
        messages.map(msg => msg.sender_id === user.id ? msg.recipient_id : msg.sender_id)
      ));

      // Fetch user profiles for these users
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Group messages by conversation
      const conversationMap = new Map<string, Conversation>();

      messages?.forEach((message: any) => {
        const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id;
        const otherUserProfile = profileMap.get(otherUserId);
        const otherUserName = message.sender_id === user.id 
          ? 'You' 
          : `${otherUserProfile?.first_name || ''} ${otherUserProfile?.last_name || ''}`.trim() || 'Unknown User';

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            other_user_id: otherUserId,
            other_user_name: otherUserName,
            last_message: message.message,
            last_message_at: message.created_at,
            unread_count: 0,
            messages: []
          });
        }

        const conversation = conversationMap.get(otherUserId)!;
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
          sender_profile: message.sender_profile
        };
        conversation.messages.push(userMessage);
        
        // Count unread messages (messages sent to current user that haven't been read)
        if (message.recipient_id === user.id && !message.read_at) {
          conversation.unread_count++;
        }
      });

      // Sort conversations by last message time
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
    
    // Mark messages as read
    if (conversation.unread_count > 0) {
      await markMessagesAsRead(conversation.other_user_id);
    }
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (error) throw error;

      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === otherUserId 
          ? { ...conv, unread_count: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
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
        <p className={`text-xs mt-1 ${isFromUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.created_at).toLocaleString([], { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {!isFromUser && !message.read_at && (
            <span className="ml-2 text-xs">•</span>
          )}
        </p>
      </div>
    </div>
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || !user) return;

    const messageToSend = messageText.trim();
    const currentTime = new Date().toISOString();
    
    // Create optimistic message immediately
    const optimisticMessage: UserMessage = {
      id: `temp-${Date.now()}-${Math.random()}`, // Temporary unique ID
      sender_id: user.id,
      recipient_id: selectedConversation.other_user_id,
      subject: 'Reply',
      message: messageToSend,
      read_at: null,
      created_at: currentTime,
      conversation_id: selectedConversation.messages[0]?.conversation_id || crypto.randomUUID(),
      related_property_id: null,
      sender_profile: {
        first_name: user.user_metadata?.first_name || 'You',
        last_name: user.user_metadata?.last_name || ''
      }
    };

    // Immediately update selected conversation with optimistic message
    const updatedSelectedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, optimisticMessage],
      last_message: messageToSend,
      last_message_at: currentTime
    };
    
    setSelectedConversation(updatedSelectedConversation);
    
    // Immediately update conversations list with optimistic message
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

    setMessageText(''); // Clear input after optimistic update

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

      // Replace optimistic message with real message
      const realMessage: UserMessage = {
        ...data,
        sender_profile: {
          first_name: user.user_metadata?.first_name || 'You',
          last_name: user.user_metadata?.last_name || ''
        }
      };

      // Update selected conversation with real message
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === optimisticMessage.id ? realMessage : msg
        )
      } : null);

      // Update conversations list with real message
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
      
      // Remove optimistic message on error and restore input
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
      
      setMessageText(messageToSend); // Restore message text on error
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
        <div className="text-sm text-gray-600">
          {conversations.length} conversations
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
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

        {/* Chat Interface */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border border-gray-200 rounded-t-lg p-4 border-b">
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

              {/* Messages */}
              <div className="flex-1 bg-white border-l border-r border-gray-200 p-4 overflow-y-auto">
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((message) => (
                      <MessageBubble 
                        key={message.id} 
                        message={message} 
                        isFromUser={message.sender_id === user?.id}
                      />
                    ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border border-gray-200 rounded-b-lg p-4 border-t">
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
                    disabled={!messageText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <Clock size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unread Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <MessageSquare size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {conversations.reduce((sum, conv) => sum + conv.messages.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter; 