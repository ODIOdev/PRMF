import { createClient } from "@/lib/supabase/server";
import { completeTask, createTask } from "../crm-actions";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("tasks").select("*").order("due_at", { ascending: true, nullsFirst: false });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Follow-ups</h1>
      <form action={createTask} className="mt-6 flex flex-wrap gap-3 border border-chrome bg-white p-4">
        <input name="title" placeholder="Task title" className="h-10 flex-1 rounded-lg border px-3" required />
        <input name="due_at" type="datetime-local" className="h-10 rounded-lg border px-3" />
        <button className="h-10 rounded-lg bg-primary px-4 text-sm text-primary-foreground">Add task</button>
      </form>
      <ul className="mt-6 space-y-3">
        {(data ?? []).map((task) => (
          <li key={task.id} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm">
            <div>
              <p className={task.completed_at ? "text-muted-foreground line-through" : "font-medium"}>{task.title}</p>
              <p className="text-xs text-muted-foreground">
                {task.due_at ? new Date(task.due_at).toLocaleString() : "No due date"}
              </p>
            </div>
            {!task.completed_at ? (
              <form action={completeTask}>
                <input type="hidden" name="id" value={task.id} />
                <button className="text-primary">Complete</button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
