import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Paperclip, Image as ImageIcon, FileText, Download, Minimize2, Maximize2, User, Headphones } from 'lucide-react';
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
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [supportStatus, setSupportStatus] = useState({ isOnline: true, message: "Online - We'll respond soon" });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSupportSettings();
  }, []);

  useEffect(() => {
    if (user && isOpen) {
      loadOrCreateConversation();
    }
  }, [user, isOpen]);

  const loadSupportSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('support_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading support settings:', error);
        return;
      }

      if (data) {
        setSupportStatus({
          isOnline: data.is_online,
          message: data.custom_message
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      const channel = subscribeToMessages();

      pollingIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 2000);

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
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
      const newMessages = data || [];
      setMessages(newMessages);

      const unread = newMessages.filter(m => m.sender_type === 'admin' && !m.read).length;
      setUnreadCount(unread);
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

          if (newMessage.sender_type === 'admin' && !newMessage.read) {
            setUnreadCount(prev => prev + 1);
          }
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

    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        sender_type: 'user',
        message: messageText,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    } else if (data) {
      setMessages((prev) => {
        if (prev.find(m => m.id === data.id)) {
          return prev;
        }
        return [...prev, data as Message];
      });
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
          onClick={() => {
            setIsOpen(true);
            setUnreadCount(0);
          }}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 hover:from-cyan-600 hover:via-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 min-w-[28px] h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-red-500/50 animate-pulse px-2">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>
      )}

      {isOpen && (
        <div className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-0 right-0 sm:bottom-6 sm:right-6'} ${isMinimized ? 'w-80' : 'w-full h-full sm:w-[440px] sm:h-[min(680px,80vh)] lg:h-[min(700px,85vh)]'} bg-white sm:rounded-3xl shadow-2xl flex flex-col z-50 border-0 sm:border border-slate-200 transition-all duration-300 overflow-hidden`}>
          <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 text-white px-6 py-5 sm:rounded-t-3xl flex items-center justify-between shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 min-w-0 relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 border border-white/30">
                <Headphones className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-lg truncate">Support Chat</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2.5 h-2.5 ${supportStatus.isOnline ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-slate-400'} rounded-full`} />
                  <p className="text-xs text-white/90 truncate font-medium">{supportStatus.message}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 backdrop-blur-sm hidden sm:block"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 backdrop-blur-sm"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-50">
                {messages.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                      <MessageCircle className="w-10 h-10 text-cyan-600" />
                    </div>
                    <p className="text-slate-900 font-bold text-lg mb-2">Welcome to Support!</p>
                    <p className="text-slate-500 text-sm px-8 leading-relaxed">
                      Our team is here to help you with any questions or issues. Start the conversation!
                    </p>
                  </div>
                )}
                {messages.map((msg, index) => {
                  const isUser = msg.sender_type === 'user';
                  const showAvatar = index === 0 || messages[index - 1].sender_type !== msg.sender_type;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300`}
                    >
                      {!isUser && showAvatar && (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-lg border border-slate-600">
                          <Headphones className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {!isUser && !showAvatar && <div className="w-10" />}

                      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[80%]`}>
                        <div
                          className={`rounded-2xl px-5 py-3.5 shadow-lg ${
                            isUser
                              ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 text-white rounded-tr-md'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-tl-md'
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.message}</p>
                          {msg.attachment_url && (
                            <div className="mt-3">
                              {isImage(msg.attachment_type) ? (
                                <img
                                  src={msg.attachment_url}
                                  alt={msg.attachment_name}
                                  className={`max-w-full rounded-xl shadow-lg ${isUser ? 'border-2 border-white/30' : 'border border-slate-200'}`}
                                  style={{ maxHeight: '200px' }}
                                />
                              ) : (
                                <a
                                  href={msg.attachment_url}
                                  download={msg.attachment_name}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-105 ${
                                    isUser
                                      ? 'bg-white/10 hover:bg-white/20 border-2 border-white/30'
                                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                >
                                  <FileText className="w-5 h-5 flex-shrink-0" />
                                  <span className="text-sm font-medium truncate flex-1">{msg.attachment_name}</span>
                                  <Download className="w-4 h-4 flex-shrink-0" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <p className={`text-xs mt-1.5 ${isUser ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {isUser && showAvatar && (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg border border-cyan-400">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {isUser && !showAvatar && <div className="w-10" />}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-5 border-t border-slate-200 bg-white sm:rounded-b-3xl">
                {selectedFile && (
                  <div className="mb-3 flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200 shadow-sm">
                    {isImage(selectedFile.type) ? (
                      <ImageIcon className="w-6 h-6 text-cyan-600 flex-shrink-0" />
                    ) : (
                      <FileText className="w-6 h-6 text-cyan-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-cyan-900 font-semibold truncate block">{selectedFile.name}</span>
                      <span className="text-xs text-cyan-600 font-medium">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-cyan-600 hover:text-cyan-800 transition-colors hover:scale-110 flex-shrink-0"
                      disabled={uploadingFile}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {uploadingFile && (
                  <div className="mb-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-cyan-900 font-semibold">Uploading file...</span>
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
                    className="bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 p-3.5 rounded-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md flex-shrink-0"
                    aria-label="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-5 py-3.5 border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all bg-slate-50 focus:bg-white"
                    disabled={isLoading || uploadingFile}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || uploadingFile || (!newMessage.trim() && !selectedFile)}
                    className="bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 hover:from-cyan-600 hover:via-blue-600 hover:to-blue-700 text-white px-6 py-3.5 rounded-2xl transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-cyan-500/40 font-semibold flex-shrink-0"
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
