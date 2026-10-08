import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatService } from '../services/chatService';
import type { ChatMessage, RecommendedProduct } from '../types/chat';

const QUICK_SUGGESTIONS = [
  '💻 Gợi ý laptop giá rẻ',
  '📱 So sánh điện thoại',
  '🎧 Tìm tai nghe tốt nhất',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Xin chào! 👋 Tôi là trợ lý AI của **ElectroTech**. Tôi có thể giúp bạn:\n\n• 🔍 Tìm kiếm & gợi ý sản phẩm phù hợp\n• ⚖️ So sánh các sản phẩm\n• 💡 Tư vấn mua sắm thông minh\n\nBạn cần tôi giúp gì?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Build history for context (exclude the welcome message and loading indicators)
    const history = messages
      .filter((m) => !m.isLoading)
      .slice(1) // skip welcome message
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await chatService.sendMessage(trimmed, history);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        products: response.products || undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: '❌ Xin lỗi, đã xảy ra lỗi khi kết nối tới trợ lý AI. Vui lòng thử lại sau.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Simple markdown-like rendering: **bold**, \n → <br>, bullet points
  const renderContent = (content: string) => {
    const lines = (content || '').split('\n');
    return lines.map((line, i) => {
      // Bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        // Clean [ID:xxx] tags from display
        return <span key={j}>{part.replace(/\[ID:\d+\]/g, '')}</span>;
      });

      return (
        <span key={i}>
          {rendered}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  const renderProductCard = (product: RecommendedProduct) => (
    <Link
      to={`/products/${product.productId}`}
      key={product.productId}
      className="flex items-center gap-3 p-2.5 bg-surface-container-low hover:bg-surface-container rounded-lg border border-outline-variant/50 transition-colors group"
      onClick={() => setIsOpen(false)}
    >
      <div className="w-12 h-12 bg-surface-container rounded overflow-hidden flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-lg">image</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
          {product.productName}
        </p>
        <p className="text-xs font-bold text-primary">{formatPrice(product.price)}</p>
      </div>
      <span className="material-symbols-outlined text-secondary text-sm group-hover:text-primary transition-colors">
        arrow_forward
      </span>
    </Link>
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[9990] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-secondary text-on-secondary rotate-0'
            : 'bg-primary text-on-primary'
        }`}
        aria-label={isOpen ? 'Đóng chat' : 'Mở trợ lý AI'}
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-[9989] w-[380px] max-w-[calc(100vw-24px)] transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl flex flex-col overflow-hidden"
             style={{ height: '520px' }}>
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-xl">smart_toy</span>
            </div>
            <div className="flex-1">
              <h3 className="text-on-primary font-semibold text-sm">Trợ lý ElectroTech</h3>
              <p className="text-on-primary/70 text-[11px]">Tư vấn sản phẩm bằng AI</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-primary/70 hover:text-on-primary p-1 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-on-primary rounded-br-md'
                      : 'bg-surface-container text-on-surface rounded-bl-md'
                  }`}
                >
                  {renderContent(msg.content)}

                  {/* Product Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <p className="text-[11px] font-semibold opacity-70 uppercase tracking-wide">
                        Sản phẩm gợi ý:
                      </p>
                      {msg.products.map(renderProductCard)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[11px] text-secondary ml-1">Đang suy nghĩ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (show only when no user messages yet) */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {QUICK_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickSuggestion(s)}
                  className="text-[11px] font-medium px-3 py-1.5 bg-primary/5 text-primary border border-primary/20 rounded-full hover:bg-primary/10 transition-colors whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-outline-variant p-3 flex items-center gap-2 flex-shrink-0 bg-surface-container-lowest"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về sản phẩm..."
              disabled={isLoading}
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-full px-4 py-2 text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
