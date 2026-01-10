import type { MouseEventHandler, ComponentType, SVGProps } from "react";

type ActionButtonColor = "blue" | "red" | "green" | "gray";

interface TableActionButtonProps {
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onPress: MouseEventHandler<HTMLButtonElement>;
  color?: ActionButtonColor;
}

const COLOR_STYLES: Record<ActionButtonColor, string> = {
  blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  red: "bg-red-50 text-red-700 hover:bg-red-100",
  green: "bg-green-50 text-green-700 hover:bg-green-100",
  gray: "bg-gray-50 text-gray-700 hover:bg-gray-100",
};

export function TableActionButton({
  title,
  icon: Icon,
  onPress,
  color = "blue",
}: TableActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`
        inline-flex items-center gap-1.5
        rounded-md
        px-2.5 py-1.5
        text-sm
        shadow-xs
        active:translate-y-px
        active:shadow-none
        transition
        ${COLOR_STYLES[color]}
      `}
    >
      <Icon className="size-4" aria-hidden />
      {title}
    </button>
  );
}
