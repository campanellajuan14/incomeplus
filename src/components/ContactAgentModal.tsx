import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface ContactAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    property_title: string;
    agent_name: string;
    agent_email: string;
    user_id?: string;
  };
}

const ContactAgentModal: React.FC<ContactAgentModalProps> = ({ isOpen, onClose, property }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState(`Inquiry about ${property.property_title}`);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim() || !property.user_id) return;

    console.log('Attempting to send message...');
    console.log('User:', user);
    console.log('Property:', property);

    setIsLoading(true);
    try {
      const insertData = {
        sender_id: user.id,
        recipient_id: property.user_id,
        subject: subject.trim(),
        message: message.trim(),
        related_property_id: property.id,
        conversation_id: crypto.randomUUID()
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('user_messages')
        .insert(insertData)
        .select();

      console.log('Supabase response:', { data, error });

      if (error) throw error;

      // Reset form and close modal
      setMessage('');
      setSubject(`Inquiry about ${property.property_title}`);
      onClose();
      
      // Show success message
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Contact Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <User size={16} className="mr-2" />
              <span>{property.agent_name}</span>
            </div>
            <p className="text-sm text-gray-500">{property.agent_email}</p>
            <p className="text-sm text-gray-700 mt-1">Property: {property.property_title}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your message..."
                required
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send size={16} className="mr-1" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactAgentModal;