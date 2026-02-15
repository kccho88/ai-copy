"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  RotateCcw,
  Check,
  Sparkles,
  Moon,
  Sun,
  ChevronDown,
  Loader2
} from "lucide-react";

export default function Home() {
  const [emailContent, setEmailContent] = useState("");
  const [tone, setTone] = useState("기본");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크모드 토글 설정
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleGenerate = async () => {
    if (emailContent.length < 10) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: emailContent, tone }),
      });

      if (!response.ok) {
        throw new Error("API 요청에 실패했습니다.");
      }

      const data = await response.json();
      if (data.titles && data.titles.length > 0) {
        setResults(data.titles);
      } else {
        throw new Error("추천 제목을 생성하지 못했습니다.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("AI 제목 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000);
  };

  const handleRegenerateOne = async (index: number) => {
    const newResults = [...results];
    newResults[index] = `[${tone}] 다시 생성된 새로운 제목 ${index + 1}: ${emailContent.slice(0, 15)}...`;
    setResults(newResults);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-300">
      {/* 3. 상단 헤더 영역 */}
      <header className="sticky top-0 z-50 h-[60px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">AI 카피라이터</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="text-sm font-medium px-4 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            로그인
          </button>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-6 py-20 space-y-12">
        {/* 4. 메인 입력 영역 */}
        <section className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">이메일 내용을 입력하세요</h1>
            <p className="text-slate-500 dark:text-zinc-400">
              본문을 분석해 클릭을 부르는 제목 3가지를 만들어 드립니다.
            </p>
          </div>

          <div className="relative group">
            <textarea
              id="EmailContentTextarea"
              className="w-full min-h-[220px] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-lg"
              placeholder="예시)&#10;안녕하세요.&#10;이번 주 신규 프로모션 안내드립니다..."
              maxLength={2000}
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-sm text-slate-400">
              {emailContent.length} / 2000자
            </div>
          </div>

          {/* 5. 옵션 영역 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-zinc-400 ml-1">
              제목 톤 선택 (선택사항)
            </label>
            <div className="relative">
              <select
                id="ToneSelect"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer text-base"
              >
                <option>기본</option>
                <option>긴급한 느낌</option>
                <option>부드러운 느낌</option>
                <option>신뢰감 있는 느낌</option>
                <option>세일즈 중심</option>
                <option>호기심 유발형</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* 6. CTA 버튼 영역 */}
          <button
            id="GenerateButton"
            disabled={emailContent.length < 10 || isLoading}
            onClick={handleGenerate}
            className={`w-full h-[52px] rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${emailContent.length < 10 || isLoading
                ? "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                생성 중입니다...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                제목 3가지 생성하기
              </>
            )}
          </button>
        </section>

        {/* 7. 결과 출력 영역 */}
        {results.length > 0 && (
          <section className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 border-l-4 border-blue-600 pl-4 py-1">
              <h2 className="text-2xl font-bold">✍ 추천 제목</h2>
            </div>

            <div className="grid gap-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-xl font-bold flex-1 leading-relaxed">{result}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(result, index)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copiedIndex === index
                            ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          }`}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-4 h-4" />
                            복사 완료!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            복사
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRegenerateOne(index)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="이 스타일로 다시 생성"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-500 dark:text-zinc-400 font-medium hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              다른 제목 다시 받기
            </button>
          </section>
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="py-12 border-t border-slate-200 dark:border-zinc-800 text-center text-slate-400 text-sm">
        &copy; 2024 AI 카피라이터. 모든 권리 보유.
      </footer>
    </div>
  );
}
