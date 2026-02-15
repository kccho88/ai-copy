import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { content, tone } = await req.json();

        if (!content || content.length < 10) {
            return NextResponse.json(
                { error: "내용이 너무 짧습니다. 최소 10자 이상 입력해주세요." },
                { status: 400 }
            );
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `당신은 매력적인 이메일 제목을 만드는 전문 카피라이터입니다. 
          사용자가 제공하는 이메일 본문을 분석하여, 클릭률을 높일 수 있는 매력적인 제목 3가지를 제안하세요.
          반드시 다음과 같은 JSON 형식으로만 응답하세요: {"titles": ["제목1", "제목2", "제목3"]}`
                },
                {
                    role: "user",
                    content: `이메일 본문: ${content}\n요청하는 톤: ${tone}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const resultText = response.choices[0].message.content || "{}";
        console.log("Raw AI Response:", resultText);

        let titles: string[] = [];
        try {
            const parsedResult = JSON.parse(resultText);

            // 1. "titles" 키가 있고 배열인 경우
            if (parsedResult.titles && Array.isArray(parsedResult.titles)) {
                titles = parsedResult.titles;
            }
            // 2. 객체의 값들이 모두 문자열인 경우 (제목1: "값" 형태 대응)
            else if (typeof parsedResult === "object" && parsedResult !== null) {
                const values = Object.values(parsedResult);
                if (values.length > 0 && values.every(v => typeof v === "string")) {
                    titles = values as string[];
                } else {
                    const possibleArray = values.find(Array.isArray);
                    if (possibleArray) titles = possibleArray;
                }
            }
        } catch (e) {
            console.error("JSON Parsing Error:", e);
        }

        // 3. 폴백 파싱 (JSON이 아니거나 배열이 비어있는 경우)
        if (titles.length === 0) {
            titles = resultText
                .replace(/[{}"'\[\]]/g, "") // 특수문자 제거
                .split("\n")
                .map(t => t.replace(/^[-*•\d\.\:\s]+/, "").trim()) // 불필요한 서두 제거
                .filter(t => t.length > 5)
                .slice(0, 3);
        }

        console.log("Final Titles Processed:", titles);
        return NextResponse.json({ titles });
    } catch (error: any) {
        console.error("OpenAI API Detail Error:", error);
        return NextResponse.json(
            { error: "AI 제목 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
            { status: 500 }
        );
    }
}
