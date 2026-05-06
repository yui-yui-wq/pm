import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import type { Card } from "@/lib/kanban";

type KanbanCardProps = {
  card: Card;
  stageLabel: string;
  onDelete: (cardId: string) => void;
};

const pickTags = (title: string) => {
  const normalized = title.toLowerCase();
  if (normalized.includes("design")) return ["UI", "Design"];
  if (normalized.includes("qa")) return ["QA", "Check"];
  if (normalized.includes("ship")) return ["Release", "MVP"];
  return ["Task", "MVP"];
};

export const KanbanCard = ({ card, stageLabel, onDelete }: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });
  const tags = pickTags(card.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        "rounded-lg border border-[#e7eaf1] bg-white px-3 py-3 shadow-sm",
        "transition-all duration-150",
        isDragging && "opacity-60 shadow-md"
      )}
      {...attributes}
      {...listeners}
      data-testid={`card-${card.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-sm font-semibold text-[var(--navy-dark)]">
            {card.title}
          </h4>
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-[#eef2fa] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#51607a]"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-1 text-xs leading-5 text-[var(--gray-text)]">
            {card.details}
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7b879e]">
            Stage: {stageLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(card.id)}
          className="rounded-md border border-transparent px-2 py-1 text-[11px] font-semibold text-[var(--gray-text)] transition hover:border-[var(--stroke)] hover:text-[var(--navy-dark)]"
          aria-label={`Delete ${card.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
};
