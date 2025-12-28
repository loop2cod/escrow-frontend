'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';

const userNavigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Transactions', href: '/dashboard/transactions' },
  { name: 'Profile', href: '/dashboard/profile' },
];

export function UserSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navigation = userNavigation;

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <nav className="mt-5 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
