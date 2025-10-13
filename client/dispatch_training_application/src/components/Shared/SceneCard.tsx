import React, { useState,  useRef, useEffect } from "react";
import { Card, Typography, Tag } from "antd";
import type { HighlightData, Scene } from "../../types/index.types";
import {
  BulbOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

interface SceneCardProps {
  scene: Scene;
  index: number;
  onCorrect: (index: number) => void;
  scenarioId: string;
  autoProceed?: boolean;
  audioUrl?: string;
  showHighlight: (highlight: HighlightData) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  index,
  onCorrect,
  audioUrl,
  showHighlight,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    console.log("Scene updated:", scene);
  }, [scene]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Assign observer for when the card enters view
  const handleRef = (node: HTMLDivElement | null) => {
    if (!node || !audioUrl) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && audioRef.current) {
          // Play only once
          if (audioRef.current.paused && audioRef.current.currentTime === 0) {
            audioRef.current.play().catch(() => {
              console.warn("Audio autoplay prevented by browser.");
            });
          }
        }
      },
      { threshold: 0.6 }
    );

    observerRef.current.observe(node);
  };

  const handleSelect = (option: string) => {
    if (locked) return;

    setSelected(option);

    if (option === scene.correctOption) {
      setLocked(true);
      setShowTip(false);

      // Move to next scene after short delay
      setTimeout(() => {
        onCorrect(index);
      }, 500);
    } else {
      setShowTip(true);
    }
  };

  return (
    <Card
      ref={handleRef}
      className="shadow-lg rounded-2xl p-6 md:p-10 w-full"
      bordered
      style={{ minHeight: "400px" }}
    >
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onEnded={() => {
            if (scene.options.length === 0) {
              // Auto-advance if no options
              setTimeout(() => {
                onCorrect(index);
              }, 500);
            }
          }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Title level={4} className="!text-2xl font-bold leading-snug max-w-3xl">
          {scene.sceneDescription}
        </Title>
        <Tag className="text-lg px-4 py-2 rounded-full font-medium bg-gray-100 text-gray-700 border-none">
          {scene.speaker}
        </Tag>
      </div>

      {/* Options */}
      {scene.options.length > 0 && (
        <div className="flex flex-col gap-4">
          {scene.options.map((option) => {
            const isSelected = selected === option;
            const isCorrect = option === scene.correctOption;

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={locked}
                className={`
                  w-full text-left px-5 py-4 rounded-xl border-2 transition text-lg font-medium
                  ${
                    locked
                      ? isCorrect
                        ? "border-green-600 bg-green-50 text-green-700"
                        : isSelected
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 opacity-70"
                      : isSelected
                      ? isCorrect
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-red-600 bg-red-50 text-red-700"
                      : "border-gray-300 hover:border-[#8C2131] hover:bg-gray-50"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {isSelected &&
                    (isCorrect ? (
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                    ) : (
                      <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                    ))}
                  {option}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tip */}
      {showTip && !locked && (
        <div className="mt-6 border border-blue-400 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BulbOutlined className="text-blue-500 text-xl" />
            <Text strong className="text-lg text-blue-800">
              Tip
            </Text>
          </div>
          <Paragraph className="text-gray-700 text-base mb-3">
            {scene.tip}
          </Paragraph>
          <div className="flex flex-wrap gap-2">
            {scene.highlights.map((h) => (
              <Tag
                key={h.id}
                color="blue"
                onClick={() => {
                  showHighlight(h);
                }}
                className="rounded-full px-3 py-1 text-base cursor-pointer hover:opacity-80"
              >
                {h.name}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SceneCard;
