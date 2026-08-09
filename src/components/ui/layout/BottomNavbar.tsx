"use client";

import { siteConfig } from "@/config/site";
import clsx from "clsx";
import { Link } from "@heroui/react";
import { usePathname } from "next/navigation";
import { Chip } from "@heroui/react";
import { useDictionary, TranslationKey } from "@/components/providers/DictionaryProvider";

const BottomNavbar = () => {
  const pathName = usePathname();
  const dictionary = useDictionary();
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);

  return (
    show && (
      <>
        <div className="pt-24 md:hidden" />
        <div className="fixed bottom-0 left-0 z-50 block h-fit w-full translate-y-px border-t border-secondary-background bg-background md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
          <div className="mx-auto grid h-full max-w-lg grid-cols-5">
            {siteConfig.navItems.map((item) => {
              const isActive = pathName === item.href;
              return (
                <Link
                  href={item.href}
                  key={item.href}
                  className="flex items-center justify-center text-foreground"
                >
                  <div className="flex max-h-[50px] flex-col items-center justify-center">
                    <Chip
                      size="lg"
                      variant={isActive ? "solid" : "light"}
                      classNames={{
                        base: "py-[2px] transition-all",
                        content: "size-full",
                      }}
                    >
                      {isActive ? item.activeIcon : item.icon}
                    </Chip>
                    <p className={clsx("text-[10px]", { "font-bold": isActive })}>
                      {dictionary[item.label.toLowerCase() as TranslationKey] || item.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </>
    )
  );
};

export default BottomNavbar;
