'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

const navigation = [
  { name: 'Chat', href: '/' },
  { name: 'Settings', href: '/settings' },
  { name: 'Widget', href: '/chat-widget-demo.html', target: '_blank' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image 
              src="https://www.gobusiness.gov.sg/images/Gobiz_logo_SG.svg" 
              alt="GoBusiness Logo" 
              width={160} 
              height={55} 
              priority
            />
          </Link>
        </div>
        <div className="flex gap-6 font-medium">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.target}
              className={cn(
                'transition-colors hover:text-foreground/80 flex items-center gap-1',
                pathname === item.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {item.name}
              {item.target === '_blank' && (
                <ExternalLink size={14} className="inline-block" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
