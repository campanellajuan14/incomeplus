import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Phone, Mail, Clock, CheckCircle, User } from 'lucide-react';
import { PropertyInquiry, Message } from '../../types/dashboard';

const MessagingCenter: React.FC = () => {
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<PropertyInquiry | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setInquiries([
        // Mock data - replace with actual API calls
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const InquiryCard: React.FC<{ inquiry: PropertyInquiry }> = ({ inquiry }) => (
    <div 
      className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
        selectedInquiry?.id === inquiry.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedInquiry(inquiry)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{inquiry.subject}</h3>
          <p className="text-sm text-gray-600">Property: Sample Property Title</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inquiry.status)}`}>
          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
        </span>
      </div>
      
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <User size={14} className="mr-1" />
        <span>{inquiry.agent_email}</span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center">
          <Clock size={14} className="mr-1" />
          <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center">
          <MessageSquare size={14} className="mr-1" />
          <span>{inquiry.messages?.length || 0} messages</span>
        </div>
      </div>
    </div>
  );

  const MessageBubble: React.FC<{ message: Message; isFromUser: boolean }> = ({ message, isFromUser }) => (
    <div className={`flex ${isFromUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isFromUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm">{message.message}</p>
        <p className={`text-xs mt-1 ${isFromUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedInquiry) return;

    // TODO: Implement send message API call
    console.log('Sending message:', messageText);
    setMessageText('');
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
        <h2 className="text-2xl font-bold text-gray-900">Messages & Inquiries</h2>
        <div className="text-sm text-gray-600">
          {inquiries.length} total conversations
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Inquiries List */}
        <div className="space-y-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900">Your Inquiries</h3>
          {inquiries.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={24} className="text-gray-400" />
                </div>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h4>
              <p className="text-gray-600 text-sm">
                Send inquiries about properties to start conversations with agents.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inquiry) => (
                <InquiryCard key={inquiry.id} inquiry={inquiry} />
              ))}
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedInquiry ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border border-gray-200 rounded-t-lg p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedInquiry.subject}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Mail size={14} className="mr-1" />
                      <span>{selectedInquiry.agent_email}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Phone size={16} />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Mail size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 bg-white border-l border-r border-gray-200 p-4 overflow-y-auto">
                {selectedInquiry.messages && selectedInquiry.messages.length > 0 ? (
                  selectedInquiry.messages.map((message) => (
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      isFromUser={!message.is_from_agent}
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
                <p className="text-gray-600">Choose an inquiry from the list to view messages</p>
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
              <p className="text-sm font-medium text-gray-600">Pending Responses</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
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
              <p className="text-2xl font-bold text-gray-900">0</p>
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
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter; 