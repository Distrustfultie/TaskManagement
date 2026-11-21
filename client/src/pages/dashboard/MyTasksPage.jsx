import { useTasks } from "../../context/TasksContext";
import TaskWorkspace from "../../components/tasks/TaskWorkspace";

export default function MyTasksPage() {
  const { tasks } = useTasks();
  return <TaskWorkspace tasks={tasks} />;
}
