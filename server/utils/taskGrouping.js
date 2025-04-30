import { format, isToday, isTomorrow, parseISO, startOfWeek, endOfWeek } from 'date-fns';

export const groupTasksByDate = (tasks) => {
  return tasks.reduce((groups, task) => {
    const dueDate = parseISO(task.dueDate);
    
    let group;
    switch (true) {
      case isToday(dueDate):
        group = 'Today';
        break;
      case isTomorrow(dueDate):
        group = 'Tomorrow';
        break;
      case dueDate < new Date():
        group = 'Overdue';
        break;
      case dueDate >= startOfWeek(new Date()) && dueDate <= endOfWeek(new Date()):
        group = 'This Week';
        break;
      default:
        group = 'Later';
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(task);
    return groups;
  }, {});
};