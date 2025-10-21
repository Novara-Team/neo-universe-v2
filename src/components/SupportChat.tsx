import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip, Image as ImageIcon, FileText, Download, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';

interface Message {
  id: string;
  message: string;
  sender_type: 'user' | 'admin';
  created_at: string;
  read: boolean;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
}

interface Conversation {
  id: string;
  status: string;
}

export default function SupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && isOpen) {
      loadOrCreateConversation();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      const channel = subscribeToMessages();

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [conversationId]);

  const loadOrCreateConversation = async () => {
    if (!user) return;

    const { data: conversations, error } = await supabase
      .from('support_conversations')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error loading conversation:', error);
      return;
    }

    if (conversations && conversations.length > 0) {
      setConversationId(conversations[0].id);
    } else {
      const { data: newConv, error: createError } = await supabase
        .from('support_conversations')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          status: 'open'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
      } else {
        setConversationId(newConv.id);
      }
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return null;

    const channel = supabase
      .channel(`support:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.find(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map(m => m.id === updatedMessage.id ? updatedMessage : m)
          );
        }
      )
      .subscribe();

    return channel;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user || !conversationId) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${conversationId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('support-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('support-files')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !conversationId || !user) return;

    setIsLoading(true);
    const messageText = newMessage.trim() || (selectedFile ? 'Sent a file' : '');
    let attachmentUrl = null;
    let attachmentType = null;
    let attachmentName = null;

    if (selectedFile) {
      setUploadingFile(true);
      attachmentUrl = await uploadFile(selectedFile);
      if (attachmentUrl) {
        attachmentType = selectedFile.type;
        attachmentName = selectedFile.name;
      }
      setUploadingFile(false);
      setSelectedFile(null);
    }

    setNewMessage('');

    const { error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: 'user',
        message: messageText,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName
      });

    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    }

    setIsLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const isImage = (type?: string) => {
    return type?.startsWith('image/');
  };

  if (!user) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            1
          </div>
        </button>
      )}

      {isOpen && (
        <div className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} ${isMinimized ? 'w-80' : 'w-[420px]'} ${isMinimized ? 'h-16' : 'h-[600px]'} bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 transition-all duration-300`}>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-5 rounded-t-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Support Chat</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs text-cyan-100">We're here to help</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-cyan-600" />
                    </div>
                    <p className="text-gray-900 font-semibold text-lg mb-2">Welcome to Support!</p>
                    <p className="text-gray-500 text-sm">How can we assist you today?</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                        msg.sender_type === 'user'
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      {msg.attachment_url && (
                        <div className="mt-3">
                          {isImage(msg.attachment_type) ? (
                            <img
                              src={msg.attachment_url}
                              alt={msg.attachment_name}
                              className="max-w-full rounded-xl border-2 border-white/30 shadow-lg"
                              style={{ maxHeight: '220px' }}
                            />
                          ) : (
                            <a
                              href={msg.attachment_url}
                              download={msg.attachment_name}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all hover:scale-105 ${
                                msg.sender_type === 'user'
                                  ? 'border-white/30 hover:bg-white/10 bg-white/5'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <FileText className="w-5 h-5" />
                              <span className="text-sm font-medium truncate flex-1">{msg.attachment_name}</span>
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p
                          className={`text-xs ${
                            msg.sender_type === 'user' ? 'text-cyan-100' : 'text-gray-400'
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {msg.sender_type === 'user' && (
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-cyan-200" />
                            <div className="w-1 h-1 rounded-full bg-cyan-200" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-5 border-t border-gray-200 bg-white rounded-b-2xl">
                {selectedFile && (
                  <div className="mb-3 flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                    {isImage(selectedFile.type) ? (
                      <ImageIcon className="w-5 h-5 text-cyan-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-cyan-600" />
                    )}
                    <div className="flex-1">
                      <span className="text-sm text-cyan-900 font-medium truncate block">{selectedFile.name}</span>
                      <span className="text-xs text-cyan-600">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-cyan-600 hover:text-cyan-800 transition-colors"
                      disabled={uploadingFile}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {uploadingFile && (
                  <div className="mb-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-cyan-900 font-medium">Uploading file...</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || uploadingFile}
                    className="bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 p-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm"
                    aria-label="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all"
                    disabled={isLoading || uploadingFile}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || uploadingFile || (!newMessage.trim() && !selectedFile)}
                    className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-cyan-500/30 font-medium"
                    aria-label="Send message"
                  >
                    {uploadingFile ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
