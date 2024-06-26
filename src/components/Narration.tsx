"use client";
import Caption from "./Caption";
import { useEffect, useState } from "react";
import { getGeminiVision } from "@/ai/gemini";
import Animation from "./Animation";
import { describeImagePrompt } from "@/ai/prompts";
//Component that turns anything into a narrated script
export default function Narration({
  scenario,
  onNarration,
  onCompleteLine,
}: {
  scenario: string;
  onNarration?: (narration: string) => void;
  onCompleteLine?: (line: string, nextLine: string) => void;
}) {
  const [script, setScript] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string | null>(null);

  useEffect(() => {
    //generate the narrative
    const generateNarrative = async () => {
      const description = await getGeminiVision(
        scenario,
        undefined,
        `You are provided with a world state and an array of agents performing tasks to make changes to this world state. 
        Write a short script that narrates a documentary film that dramatizes these events and embellishes them where necessary to make them 
        engaging to the audience. Narrate the documenary as lines of dialogue by a narrator and other characters. Place each item of dialogue on a new line. 
        Each line should be in the format "Speaker: Dialogue". Do not include any other text or explanation.`
      );
      setScript(description.split("\n"));
      setCurrentLine(0);
      setCurrentText(description.split("\n")[0]);
      if (onNarration) onNarration(description);
    };

    generateNarrative();
  }, [scenario]);

  const handleReadText = () => {
    if (currentLine < script.length - 1) {
      setCurrentLine(currentLine + 1);
      setCurrentText(script[currentLine + 1]);
      if (onCompleteLine)
        onCompleteLine(script[currentLine], script[currentLine + 1]);
    }
  };

  useEffect(() => {
    console.log("current text", currentText);
  }, [currentText]);
  return (
    <>
      {currentText && (
        <>
          <Caption
            text={script[currentLine]}
            speech
            onComplete={handleReadText}
          />
          <Animation
            prompt={script[currentLine]}
            systemPrompt={describeImagePrompt}
            width={1344}
            height={1024}
            video={false}
          />
        </>
      )}
    </>
  );
}
