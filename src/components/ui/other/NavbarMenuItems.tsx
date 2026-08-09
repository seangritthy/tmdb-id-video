import { siteConfig } from "@/config/site";
import { Link, Tab, Tabs, TabsProps } from "@heroui/react";
import { usePathname } from "next/navigation";
import { useDictionary, TranslationKey } from "@/components/providers/DictionaryProvider";

interface NavbarMenuItemsProps extends TabsProps {
  withIcon?: boolean;
  menuArray?: {
    href: string;
    label: string;
    icon?: React.ReactNode;
    activeIcon?: React.ReactNode;
  }[];
}

const NavbarMenuItems: React.FC<NavbarMenuItemsProps> = ({
  menuArray = siteConfig.navItems,
  isVertical,
  withIcon,
  variant = "underlined",
  size = "lg",
}) => {
  const pathName = usePathname();
  const dictionary = useDictionary();

  return (
    <Tabs
      size={size}
      variant={variant}
      selectedKey={pathName}
      isVertical={isVertical}
      classNames={{
        tabList: isVertical && "gap-5",
        tab: "h-full w-full",
      }}
    >
      {menuArray.map((item) => {
        const isActive = pathName === item.href;
        const translatedLabel = dictionary[item.label.toLowerCase() as TranslationKey] || item.label;
        let title: React.ReactNode = translatedLabel;

        if (withIcon) {
          title = (
            <div className="flex max-h-[45px] flex-col items-center gap-1">
              {isActive ? item.activeIcon : item.icon}
              <p>{translatedLabel}</p>
            </div>
          );
        }

        return (
          <Tab as={Link} href={item.href} key={item.href} className="text-start" title={title} />
        );
      })}
    </Tabs>
  );
};

export default NavbarMenuItems;
