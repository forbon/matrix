import type { QuadrantId, Task } from '../types';
import { QUADRANT_IDS } from '../types';
import { Quadrant } from './Quadrant';

interface Props {
  tasks: Task[];
  onDropTask: (id: string, target: QuadrantId) => void;
  onAdd: (quadrant: QuadrantId) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function Matrix(props: Props) {
  return (
    <div className="matrix">
      {QUADRANT_IDS.map((id) => (
        <Quadrant
          key={id}
          id={id}
          tasks={props.tasks.filter((t) => t.quadrant === id)}
          onDropTask={props.onDropTask}
          onAdd={props.onAdd}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
          onToggleComplete={props.onToggleComplete}
        />
      ))}
    </div>
  );
}
