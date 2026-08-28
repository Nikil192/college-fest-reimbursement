import Link from "next/link";
import { 
  LayoutDashboard, 
  PartyPopper, 
  Receipt, 
  Users, 
  CreditCard, 
  FileText, 
  BarChart, 
  Bell, 
  Settings 
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Festivals', href: '/festivals', icon: PartyPopper },
  { name: 'Reimbursements', href: '/reimbursements', icon: Receipt },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Payees', href: '/payees', icon: Users },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart },
];

const secondaryNavigation = [
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] border-r border-[var(--card-border)]">
      <div className="flex h-16 items-center px-6 text-xl font-bold tracking-tight">
        FestAdmin
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">Menu</div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-gray-800 hover:text-white"
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                {item.name}
              </Link>
            );
          })}
          
          <div className="mt-8 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">System</div>
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-gray-800 hover:text-white"
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-shrink-0 border-t border-gray-800 p-4">
        <Link href="/profile" className="group block w-full flex-shrink-0">
          <div className="flex items-center">
            <div>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500">
                <span className="text-sm font-medium leading-none text-white">AD</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs font-medium text-gray-400 group-hover:text-gray-300">View profile</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
