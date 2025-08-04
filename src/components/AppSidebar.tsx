import { Users, FileText, Package, LogOut, Tag, UserCog, Building, Activity } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import logoGregoire from '@/assets/logo-imprimerie-gregoire.png';

const navigationItems = [
  { title: "Clients", url: "/dashboard", icon: Users },
  { title: "Soumissions", url: "/dashboard/submissions", icon: FileText },
  { title: "Produits", url: "/dashboard/products", icon: Tag },
  { title: "Fournisseurs", url: "/dashboard/suppliers", icon: Building },
  { title: "Commandes", url: "/dashboard/orders", icon: Package },
  { title: "Épreuves", url: "/dashboard/proofs", icon: FileText },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const { user, signOut } = useAuth()
  const currentPath = location.pathname

  // Check if current user is admin
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isPathActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath.startsWith("/dashboard/clients/")
    }
    return currentPath.startsWith(path)
  }

  const getNavClassName = (active: boolean) =>
    active 
      ? "text-[#5a7a51] font-medium" 
      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"

  // Admin navigation items
  const adminItems = currentUserProfile?.role === 'ADMIN' ? [
    { title: "Gestion des Employés", url: "/dashboard/admin/employees", icon: UserCog },
    { title: "Historique des Actions", url: "/dashboard/admin/history", icon: Activity },
    { title: "Monitoring", url: "/dashboard/admin/monitoring", icon: Activity },
  ] : [];

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} bg-sidebar-background border-sidebar-border`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!collapsed && (
          <img 
            src={logoGregoire} 
            alt="Promotions Grégoire" 
            className="h-10 w-auto object-contain"
          />
        )}
        {collapsed && (
          <div className="text-sidebar-foreground font-bold text-center">
            PG
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider px-2">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`${getNavClassName(isPathActive(item.url))} flex items-center gap-3 rounded-lg px-3 py-2 transition-all ease-uber`}
                    >
                      <item.icon className={`h-4 w-4 ${isPathActive(item.url) ? 'text-[#5a7a51]' : ''}`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider px-2">
              {!collapsed && "Administration"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={`${getNavClassName(isPathActive(item.url))} flex items-center gap-3 rounded-lg px-3 py-2 transition-all ease-uber`}
                        >
                          <item.icon className={`h-4 w-4 ${isPathActive(item.url) ? 'text-[#5a7a51]' : ''}`} />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar-background">
        {!collapsed && (
          <div className="space-y-3">
            <div className="text-sm text-sidebar-foreground">
              <div className="font-medium">{user?.email}</div>
              <div className="text-xs text-sidebar-foreground/60">Employé connecté</div>
            </div>
            <Separator className="bg-sidebar-border" />
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full p-2 text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}