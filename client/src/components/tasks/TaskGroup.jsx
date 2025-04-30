export default function TaskGroup({ title, tasks }) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-accent mb-3">{title}</h3>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="bg-secondary/10 p-4 rounded-lg hover:bg-secondary/20 transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-dark">{task.title}</span>
                <span className="text-sm text-accent">{task.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }