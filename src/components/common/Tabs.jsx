function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="gs-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          aria-selected={activeTab === tab.id}
          className="gs-tab"
          key={tab.id}
          onClick={() => onChange(tab.id)}
          role="tab"
          type="button"
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default Tabs;
