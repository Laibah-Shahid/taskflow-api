export enum TaskItemStatus {
    Todo = 'Todo',
    InProgress = 'InProgress',
    Completed = 'Completed'
  }
  
  export enum TaskPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High'
  }
  
  export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: TaskItemStatus;
    priority: TaskPriority;
    dueDate: string | null;      // ISO 8601 string from the API
    completedAt: string | null;
    createdAt: string;
  }
  
  export interface CreateTaskRequest {
    title: string;
    description: string | null;
    status: TaskItemStatus;
    priority: TaskPriority;
    dueDate: string | null;
  }
  
  export interface UpdateTaskRequest extends CreateTaskRequest {}