
interface ActiveTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { label: string; value: string }[];
}

export default function ActiveTabs({
  activeTab,
  setActiveTab,
  tabs,
}: ActiveTabsProps) {
  return (
    <div
      style={{
        display: "flex",
        border: "1px solid #D9D9D9",
        borderRadius: 10,
        overflow: "clip",
        margin: "1.5rem 1.5rem 0 1.5rem",
      }}
    >
      {tabs.map(({ label, value }, index) => {
        const active = activeTab === value;
        return (
          <span
            key={value}
            onClick={() => setActiveTab(value)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "12px 16px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              transition: "all 0.2s ease",
              backgroundColor: active ? "#8C2131" : "#FFFFFF",
              color: active ? "#FFFFFF" : "#1F1F1F",
              borderRight:
                index !== tabs.length - 1 ? "1px solid #D9D9D9" : "none",
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
