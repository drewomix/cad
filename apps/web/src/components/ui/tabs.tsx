import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export function Tabs({ items, defaultTab }: { items: TabItem[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  return (
    <div>
      <div className="flex gap-2 border-b border-slate-800">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={cn(
              'px-3 py-2 text-sm font-medium text-slate-300 hover:text-white',
              active === item.id && 'border-b-2 border-blue-500 text-white'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {items.map((item) => (
          <div key={item.id} className={active === item.id ? 'block' : 'hidden'}>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
