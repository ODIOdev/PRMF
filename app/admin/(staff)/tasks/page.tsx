import { createDeskClient } from "@/lib/admin/session";
import { completeTask, createTask } from "../crm-actions";
import { AdminPanel } from "@/components/admin/admin-panel";
import { cn } from "@/lib/utils";

export default async function TasksPage() {
  const supabase = await createDeskClient();
  const { data } = await supabase.from("tasks").select("*").order("due_at", { ascending: true, nullsFirst: false });

  return (
    <div className="space-y-4">
      <AdminPanel className="p-4">
        <form action={createTask} className="flex flex-wrap gap-3">
          <input name="title" placeholder="Task title" required className="h-10 min-w-[12rem] flex-1 border border-input bg-white px-3 text-sm" />
          <input name="due_at" type="datetime-local" className="h-10 border border-input bg-white px-3 text-sm" />
          <button className="h-10 bg-ford px-4 text-sm font-medium text-white hover:bg-ford-bright">Add task</button>
        </form>
      </AdminPanel>
      <ul className="space-y-2">
        {(data ?? []).map((task) => (
          <li key={task.id} className="flex items-center justify-between gap-3 border border-chrome bg-white px-4 py-3 text-sm">
            <div>
              <p className={cn(task.completed_at ? "text-muted-foreground line-through" : "font-medium")}>{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.due_at ? new Date(task.due_at).toLocaleString() : "No due date"}
              </p>
            </div>
            {!task.completed_at ? (
              <form action={completeTask}>
                <input type="hidden" name="id" value={task.id} />
                <button className="text-sm font-medium text-ford hover:underline">Complete</button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
