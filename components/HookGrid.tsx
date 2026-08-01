import type { HookCardData } from "@/lib/types";
import HookCard from "./HookCard";

/**
 * Responsive card grid — 3 columns desktop, 2 tablet, 1 mobile. Deliberately
 * a CSS grid, not a carousel: every card is visible/scannable at once.
 */
export default function HookGrid({ cards }: { cards: HookCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <HookCard key={card.id} card={card} />
      ))}
    </div>
  );
}
