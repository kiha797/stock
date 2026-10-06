type AdSlotProps = {
  placement: 'dashboard-banner' | 'market-sidebar' | 'expert-inline';
  variant?: 'banner' | 'rectangle';
};

/** Layout reservation only. No Google requests until publisher/slot IDs are configured. */
export default function AdSlot({placement, variant = 'banner'}: AdSlotProps) {
  return (
    <aside className={`ad-slot ad-slot--${variant}`} data-ad-placement={placement} aria-label="광고 영역">
      <span className="ad-slot__label">광고</span>
      <div className="ad-slot__space">
        <span className="ad-slot__placeholder">광고 게재 예정</span>
      </div>
    </aside>
  );
}
