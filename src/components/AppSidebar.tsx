import { Users, FileText, Package, LogOut, Tag, UserCog } from "lucide-react"
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

const navigationItems = [
  { title: "Clients", url: "/dashboard", icon: Users },
  { title: "Soumissions", url: "/dashboard/submissions", icon: FileText },
  { title: "Produits", url: "/dashboard/products", icon: Tag },
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

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath.startsWith("/dashboard/clients/")
    }
    return currentPath.startsWith(path)
  }

  const getNavClassName = (active: boolean) =>
    active 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"

  // Admin navigation items
  const adminItems = currentUserProfile?.role === 'ADMIN' ? [
    { title: "Gestion des Employés", url: "/dashboard/admin/employees", icon: UserCog },
  ] : [];

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} bg-slate-900 border-slate-800`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-slate-800 p-4">
        {!collapsed && (
          <div className="text-white font-bold text-lg">
            Promotions Grégoire
          </div>
        )}
        {collapsed && (
          <div className="text-white font-bold text-center">
            PG
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-slate-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider px-2">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`${getNavClassName(isActive(item.url))} flex items-center gap-3 rounded-lg px-3 py-2 transition-colors`}
                    >
                      <item.icon className="h-4 w-4" />
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
            <SidebarGroupLabel className="text-slate-400 text-xs uppercase tracking-wider px-2">
              {!collapsed && "Administration"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`${getNavClassName(isActive(item.url))} flex items-center gap-3 rounded-lg px-3 py-2 transition-colors`}
                      >
                        <item.icon className="h-4 w-4" />
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

      <SidebarFooter className="border-t border-slate-800 p-4 bg-slate-900">
        {!collapsed && (
          <div className="space-y-3">
            <div className="text-sm text-slate-300">
              <div className="font-medium">{user?.email}</div>
              <div className="text-xs text-slate-500">Employé connecté</div>
            </div>
            <Separator className="bg-slate-800" />
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
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
            className="w-full p-2 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}