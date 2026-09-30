import {redirect} from "next/navigation";import {DashboardShell} from "@/components/DashboardShell";import {currentUser} from "@/lib/auth";
export default async function DashboardLayout({children}:{children:React.ReactNode}){const user=await currentUser();if(!user)redirect("/login");return <DashboardShell isAdmin={user.role==="ADMIN"}>{children}</DashboardShell>}
