import { redirect } from "next/navigation";

export default function LegacyJobPositionsPage() {
  redirect("/configuracoes?tab=jobPositions");
}
