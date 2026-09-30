import {redirect} from "next/navigation";
import {DashboardShell} from "@/components/DashboardShell";
import {PwaManager} from "@/components/PwaManager";
import {currentUser} from "@/lib/auth";
import {db} from "@/lib/db";

export default async function DashboardLayout({children}:{children:React.ReactNode}){
  const user=await currentUser();
  if(!user)redirect("/login");
  const memberships=await db.membership.findMany({
    where:{userId:user.id},
    include:{organization:true},
    orderBy:{createdAt:"asc"}
  });
  if(memberships.length===0)redirect("/registro");
  const currentId=user.activeOrganizationId&&memberships.some(m=>m.organizationId===user.activeOrganizationId)
    ?user.activeOrganizationId
    :memberships[0].organizationId;
  if(currentId!==user.activeOrganizationId){
    await db.user.update({where:{id:user.id},data:{activeOrganizationId:currentId}});
  }
  return <>
    <PwaManager/>
    <DashboardShell
      isAdmin={user.role==="ADMIN"}
      currentOrganizationId={currentId}
      organizations={memberships.map(m=>({id:m.organizationId,name:m.organization.name}))}
    >
      {children}
    </DashboardShell>
  </>;
}
