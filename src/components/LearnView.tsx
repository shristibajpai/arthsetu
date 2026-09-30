import React, { useState, useMemo } from 'react';
import { VEDIC_WISDOM_ARTICLES } from '../data/mockData';

interface LearnViewProps {
  readArticles: string[];
  onToggleReadArticle: (articleId: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  readArticles,
  onToggleReadArticle,
}) => {
  const [activeArticleId, setActiveArticleId] = useState<string>(VEDIC_WISDOM_ARTICLES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return VEDIC_WISDOM_ARTICLES;
    const q = searchQuery.toLowerCase();
    return VEDIC_WISDOM_ARTICLES.filter(
      (a) =>
        a.englishTitle.toLowerCase().includes(q) ||
        a.sanskritTitle.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.fullContent.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeArticle =
    filteredArticles.find((a) => a.id === activeArticleId) ||
    VEDIC_WISDOM_ARTICLES.find((a) => a.id === activeArticleId) ||
    VEDIC_WISDOM_ARTICLES[0];

  const isCurrentRead = readArticles.includes(activeArticle.id);

  const handleBookmark = () => {
    setToastMessage(`"${activeArticle.englishTitle}" saved to personal library.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[20px]">bookmark</span>
          <span className="font-label-md text-label-md font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div
        className="rounded-3xl p-8 lg:p-10 border border-white/60 shadow-xl relative overflow-hidden"
        style={{
          background: 'rgba(255, 250, 240, 0.75)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">menu_book</span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                Vedic Artha & Mindful Stewardship
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Timeless Financial Dharma
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              In our ancient heritage, money was never viewed as a source of anxiety or ruthless
              speculation. It was cultivated as a calm river (*pravaha*), guided by ethical banks,
              nurturing family, community, and lifelong peace of mind.
            </p>
          </div>

          {/* Progress pill */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/30 flex items-center gap-3 shrink-0 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed/80 flex items-center justify-center text-primary font-bold">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block font-medium">Wisdom Progress</span>
              <span className="font-headline-sm text-sm font-bold text-on-surface">
                {readArticles.length} of {VEDIC_WISDOM_ARTICLES.length} Treatises Mastered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Articles & Reading Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Article Selector (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-sm uppercase tracking-wider text-on-surface-variant font-bold text-xs">
              Curated Artha Treatises
            </span>
            <span className="text-xs text-primary font-semibold">
              {filteredArticles.length} Available
            </span>
          </div>

          {/* Search in Treatises */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search treatises & principles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            {filteredArticles.map((article) => {
              const isSelected = activeArticleId === article.id;
              const isRead = readArticles.includes(article.id);

              return (
                <div
                  key={article.id}
                  onClick={() => setActiveArticleId(article.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container shadow-md border-primary/40'
                      : 'bg-surface-container-low/70 hover:bg-surface-container-high text-on-surface border-white/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 opacity-80">
                    <span>{article.author}</span>
                    <div className="flex items-center gap-1.5">
                      {isRead && (
                        <span className="material-symbols-outlined text-[15px] text-primary">
                          check_circle
                        </span>
                      )}
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <h4 className="font-headline-sm text-[16px] font-bold leading-snug">
                    {article.englishTitle}
                  </h4>
                  <p className="font-headline-sm text-xs italic mt-1 opacity-90">
                    "{article.sanskritTitle}"
                  </p>
                  <p className="font-body-sm text-xs mt-2 line-clamp-2 opacity-80">
                    {article.excerpt}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Principle Box */}
          <div className="p-5 rounded-2xl bg-secondary-fixed/40 border border-secondary-fixed-dim/40 space-y-2 mt-2">
            <div className="flex items-center gap-2 text-secondary font-bold text-sm">
              <span className="material-symbols-outlined text-[18px]">spa</span>
              <span>The 50-30-20 Modified for India</span>
            </div>
            <p className="text-body-sm text-xs text-on-surface-variant leading-relaxed">
              In the Indian cultural reality, family obligations, festivals, and parental medical
              care require a modified allocation: <strong>30% Savings First</strong>,{' '}
              <strong>38% Essentials</strong>, <strong>15% Goals</strong>, and{' '}
              <strong>17% Mindful Living</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Full Reader Pane (8 cols) */}
        <div
          className="lg:col-span-8 rounded-3xl p-8 lg:p-10 shadow-xl border border-white/60 space-y-6"
          style={{
            background: 'rgba(255, 250, 240, 0.82)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="border-b border-outline-variant/30 pb-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-semibold">
                {activeArticle.readTime} · Vedic Commentary
              </span>
              <button
                onClick={() => onToggleReadArticle(activeArticle.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isCurrentRead
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCurrentRead ? 'check_circle' : 'circle'}
                </span>
                <span>{isCurrentRead ? 'Mastered' : 'Mark as Read'}</span>
              </button>
            </div>

            <h3 className="font-headline-lg text-[28px] sm:text-[32px] text-on-surface font-bold leading-tight">
              {activeArticle.englishTitle}
            </h3>
            <div className="flex items-center gap-2 text-sm text-secondary font-headline-sm font-bold">
              <span>{activeArticle.sanskritTitle}</span>
              <span>—</span>
              <span className="font-body-sm font-normal text-on-surface-variant">
                {activeArticle.author}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-high/40 border-l-4 border-secondary text-on-surface font-headline-sm text-[17px] italic leading-relaxed">
            "{activeArticle.excerpt}"
          </div>

          <div className="text-body-md text-on-surface leading-loose space-y-4 whitespace-pre-line font-body-md text-sm sm:text-base">
            {activeArticle.fullContent}
          </div>

          <div className="pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-on-surface-variant">
              From the ArthSetu Heritage Repository
            </span>
            <button
              onClick={handleBookmark}
              className="px-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-label-md shadow-xs border border-outline-variant/30 hover:bg-surface-container cursor-pointer flex items-center gap-1.5 transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">bookmark</span>
              <span>Save to Wisdom Library</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
