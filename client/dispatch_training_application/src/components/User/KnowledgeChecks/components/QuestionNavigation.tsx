// components/QuestionNavigation.tsx
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
type Props = {
  currentIndex: number;
  total: number | undefined;
  isAnswered: boolean;
  onNext: () => void;
  onPrev: () => void;
  isSubmitting?: boolean; // optional loading spinner for final submit
};

export default function QuestionNavigation({
  currentIndex,
  total,
  isAnswered,
  onNext,
  onPrev,
  isSubmitting = false,
}: Props) {
  const isLast = currentIndex === (total ? total - 1 : 0);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Button
        className="border-btn"
        size="large"
        onClick={onPrev}
        disabled={currentIndex === 0}
      >
      <LeftOutlined />  Previous
      </Button>

      <Button
        className="regular-btn"
        type="primary"
        size="large"
        onClick={onNext}
        disabled={!isAnswered}
        loading={isSubmitting}
      >
        {isLast ? "Submit" : "Next"} <RightOutlined />
      </Button>
    </div>
  );
}
