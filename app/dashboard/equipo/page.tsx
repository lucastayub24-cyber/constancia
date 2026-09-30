import {TeamManager} from "@/components/TeamManager";
import {TeamActions} from "@/components/TeamActions";
import {activeOrganization} from "@/lib/org";
import {db} from "@/lib/db";

export default async function Team(){
  const{organization,user,membership}=await activeOrganization();
  const[members,invites]=await Promise.all([
    db.membership.findMany({where:{organizationId:organization.id},include:{user:true},orderBy:{createdAt:"asc"}}),
    db.teamInvite.findMany({where:{organizationId:organization.id,acceptedAt:null,expiresAt:{gt:new Date()}},orderBy:{createdAt:"desc"}})
  ]);
  return <><header className="page-head"><div><div className="eyebrow">EQUIPO</div><h1>Personas con acceso</h1><p>Administradores, técnicos y propietarios de tu empresa.</p></div></header>
    <TeamManager enabled={organization.plan==="BUSINESS"}/>
    <section className="table-card">
      {members.map(m=><div className="table-row" style={{gridTemplateColumns:"1fr 150px 210px"}} key={m.id}>
        <div><b>{m.user.name}{m.userId===user.id?" · vos":""}</b><div className="muted">{m.user.email}</div></div>
        <span className="pill">{m.user.activeOrganizationId===organization.id?"Activo":"Con acceso"}</span>
        <TeamActions membershipId={m.id} currentRole={m.role} canManage={membership.role==="OWNER"} isSelf={m.userId===user.id}/>
      </div>)}
      {invites.map(i=><div className="table-row" style={{gridTemplateColumns:"1fr 150px 210px"}} key={i.id}><div><b>{i.email}</b><div className="muted">Invitación pendiente</div></div><span className="pill">{i.role}</span><span className="pill">Pendiente</span></div>)}
    </section>
  </>
}
