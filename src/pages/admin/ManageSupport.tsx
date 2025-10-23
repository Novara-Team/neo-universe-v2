import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, CheckCircle, Clock, XCircle, Paperclip, FileText, Image as ImageIcon, Download, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Conversation {
  id: string;
  user_id: string;
  user_email: string;
  status: 'open' | 'in_progress' | 'closed';
  last_message_at: string;
  created_at: string;
}

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

export default function ManageSupport() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');
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
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      subscribeToMessages();
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    let query = supabase
      .from('support_conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading conversations:', error);
    } else {
      setConversations(data || []);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;

    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', selectedConversation.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
    } else {
      setMessages(data || []);
      markMessagesAsRead();
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation) return;

    await supabase
      .from('support_messages')
      .update({ read: true })
      .eq('conversation_id', selectedConversation.id)
      .eq('sender_type', 'user')
      .eq('read', false);
  };

  const subscribeToMessages = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`admin_support:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => {
            if (prev.find(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!selectedConversation) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${selectedConversation.id}/${Date.now()}.${fileExt}`;

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
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation) return;

    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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

    const { error } = await supabase
      .from('support_messages')
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: 'admin',
        message: messageText,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName
      });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }

    setIsLoading(false);
  };

  const updateConversationStatus = async (status: 'open' | 'in_progress' | 'closed') => {
    if (!selectedConversation) return;

    const { error } = await supabase
      .from('support_conversations')
      .update({ status })
      .eq('id', selectedConversation.id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      setSelectedConversation({ ...selectedConversation, status });
      loadConversations();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'in_progress':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col lg:flex-row gap-4 md:gap-6">
      <div className="w-full lg:w-96 xl:w-1/3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden flex flex-col max-h-[300px] lg:max-h-none">
        <div className="p-4 md:p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            Support Conversations
          </h2>
          <div className="flex flex-wrap gap-2">
            {(['all', 'open', 'in_progress', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 md:p-4 border-b border-slate-700 hover:bg-slate-700/30 text-left transition-all ${
                  selectedConversation?.id === conv.id ? 'bg-slate-700/50 border-l-4 border-l-cyan-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-white text-sm md:text-base truncate pr-2">{conv.user_email}</span>
                  {getStatusIcon(conv.status)}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(conv.status)}`}>
                    {conv.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(conv.last_message_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-0">
        {selectedConversation ? (
          <>
            <div className="p-4 md:p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-white text-base md:text-lg">{selectedConversation.user_email}</h3>
                  <p className="text-xs md:text-sm text-slate-400">
                    Started {new Date(selectedConversation.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateConversationStatus('open')}
                  disabled={selectedConversation.status === 'open'}
                  className="px-3 py-1.5 text-xs md:text-sm rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 disabled:opacity-50 transition-all border border-yellow-500/20 font-medium"
                >
                  Mark Open
                </button>
                <button
                  onClick={() => updateConversationStatus('in_progress')}
                  disabled={selectedConversation.status === 'in_progress'}
                  className="px-3 py-1.5 text-xs md:text-sm rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all border border-blue-500/20 font-medium"
                >
                  In Progress
                </button>
                <button
                  onClick={() => updateConversationStatus('closed')}
                  disabled={selectedConversation.status === 'closed'}
                  className="px-3 py-1.5 text-xs md:text-sm rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-all border border-green-500/20 font-medium"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-gradient-to-b from-slate-900/30 to-slate-950/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-xl p-3 md:p-4 shadow-lg ${
                      msg.sender_type === 'admin'
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                        : 'bg-slate-700/50 text-white border border-slate-600'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                    {msg.attachment_url && (
                      <div className="mt-3">
                        {isImage(msg.attachment_type) ? (
                          <img
                            src={msg.attachment_url}
                            alt={msg.attachment_name}
                            className="max-w-full rounded-lg border-2 border-white/20"
                            style={{ maxHeight: '200px' }}
                          />
                        ) : (
                          <a
                            href={msg.attachment_url}
                            download={msg.attachment_name}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all hover:scale-105 ${
                              msg.sender_type === 'admin'
                                ? 'border-white/30 hover:bg-white/10'
                                : 'border-slate-500 hover:bg-slate-600'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="text-xs truncate flex-1">{msg.attachment_name}</span>
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                    <p
                      className={`text-xs mt-2 ${
                        msg.sender_type === 'admin' ? 'text-cyan-100' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 md:p-6 border-t border-slate-700 bg-slate-800/50">
              {selectedFile && (
                <div className="mb-3 flex items-center gap-2 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  {isImage(selectedFile.type) ? (
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className="text-sm text-cyan-300 flex-1 truncate">{selectedFile.name}</span>
                  <span className="text-xs text-cyan-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    disabled={uploadingFile}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {uploadingFile && (
                <div className="mb-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-cyan-300">Uploading file...</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 md:gap-3">
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
                  disabled={isLoading || uploadingFile || selectedConversation.status === 'closed'}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 md:p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-slate-400 text-sm transition-all"
                  disabled={isLoading || uploadingFile || selectedConversation.status === 'closed'}
                />
                <button
                  type="submit"
                  disabled={isLoading || uploadingFile || (!newMessage.trim() && !selectedFile) || selectedConversation.status === 'closed'}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan-500/30 font-medium text-sm"
                >
                  {uploadingFile ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-sm md:text-base">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}