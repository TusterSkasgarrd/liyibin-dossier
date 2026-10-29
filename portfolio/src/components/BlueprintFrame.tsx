/** 图纸外框 + 四角十字 + 右下角图签栏。固定定位，不参与文档流。 */

const today = new Date();
const dateText = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(
  today.getDate()
).padStart(2, '0')}`;

export function BlueprintFrame() {
  return (
    <div className="bp-frame" aria-hidden="true">
      <i className="bp-corner bp-corner--tl" />
      <i className="bp-corner bp-corner--tr" />
      <i className="bp-corner bp-corner--bl" />
      <i className="bp-corner bp-corner--br" />

      <div className="bp-titleblock">
        <span>图名</span>
        <span>个人履历 · 工程档案</span>
        <span>图号</span>
        <span>LYB-PF-2026-01</span>
        <span>比例</span>
        <span>1 : 1</span>
        <span>制图</span>
        <span>李亦斌</span>
        <span>日期</span>
        <span>{dateText}</span>
        <span>版本</span>
        <span>v1.0</span>
      </div>
    </div>
  );
}
