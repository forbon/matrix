import { useState } from 'react';
import type { QuadrantId, Task } from '../types';
import { QUADRANT_IDS } from '../types';
import { Quadrant } from './Quadrant';
import { QuadrantTabs } from './QuadrantTabs';
import { useMediaQuery, MOBILE_QUERY } from '../hooks/useMediaQuery';

interface Props {
  tasks: Task[];
  onDropTask: (id: string, target: QuadrantId) => void;
  onAdd: (quadrant: QuadrantId) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToBacklog: (id: string) => void;
  onArchive: (id: string) => void;
}

export function Matrix(props: Props) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [active, setActive] = useState<QuadrantId>('do');

  return (
    <>
      {isMobile && (
        <QuadrantTabs tasks={props.tasks} active={active} onSelect={setActive} />
      )}
      <div className={`matrix ${isMobile ? 'matrix--mobile' : ''}`}>
        {QUADRANT_IDS.map((id) => (
          <Quadrant
            key={id}
            id={id}
            tasks={props.tasks.filter((t) => t.quadrant === id)}
            hidden={isMobile && id !== active}
            allowDragDrop={!isMobile}
            onDropTask={props.onDropTask}
            onAdd={props.onAdd}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
            onToggleComplete={props.onToggleComplete}
            onMove={props.onDropTask}
            onToBacklog={props.onToBacklog}
            onArchive={props.onArchive}
          />
        ))}
      </div>
    </>
  );
}
