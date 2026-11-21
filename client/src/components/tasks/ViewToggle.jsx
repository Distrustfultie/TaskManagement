import { Columns3, List } from "lucide-react";
import Segmented from "../ui/Segmented";

const VIEWS = [
  { value: "list", label: "List", icon: List },
  { value: "board", label: "Board", icon: Columns3 },
];

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="shrink-0">
      <Segmented
        label="View"
        size="sm"
        options={VIEWS}
        value={value}
        onChange={onChange}
        renderOption={(o) => (
          <>
            <o.icon size={15} />
            <span className="hidden sm:inline">{o.label}</span>
            <span className="sr-only sm:hidden">{o.label}</span>
          </>
        )}
      />
    </div>
  );
}
