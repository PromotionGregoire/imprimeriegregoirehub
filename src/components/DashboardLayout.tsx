import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardLayout = () => {
  const isMobile = useIsMobile();

  // Show bottom navigation for mobile AND tablet (below lg breakpoint)
  const useBottomNav = isMobile || (typeof window !== 'undefined' && window.innerWidth < 1024);
  
  if (useBottomNav) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <main className="flex-1 bg-background pb-20">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-12 sm:h-14 lg:h-16 flex items-center border-b bg-background px-4 sm:px-6 lg:px-8">
            <SidebarTrigger />
          </header>
          <div className="flex-1 bg-background">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;