import { redirect } from "next/navigation";

export default function LegacyDepartmentsPage() {
  redirect("/configuracoes?tab=departments");
}
