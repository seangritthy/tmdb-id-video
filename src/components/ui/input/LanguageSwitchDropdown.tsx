"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useEffect, useState } from "react";
import { LOCALE_COOKIE_KEY, Locale } from "@/utils/i18n";
import { useRouter } from "next/navigation";

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: "km", name: "ខ្មែរ (Khmer)", flag: "🇰🇭" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

const LanguageSwitchDropdown = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<Locale>("km");

  useEffect(() => {
    // Read cookie on mount
    const match = document.cookie.match(new RegExp('(^| )' + LOCALE_COOKIE_KEY + '=([^;]+)'));
    if (match && match[2] === "en") {
      setLocale("en");
    } else {
      setLocale("km");
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  const handleLanguageChange = (code: Locale) => {
    // Set cookie that lasts for 1 year
    document.cookie = `${LOCALE_COOKIE_KEY}=${code};path=/;max-age=31536000`;
    setLocale(code);
    
    // Hard refresh to apply server-side translations
    window.location.reload();
  };

  return (
    <Dropdown
      showArrow
      classNames={{
        content: "min-w-fit",
      }}
    >
      <DropdownTrigger>
        <Button isIconOnly variant="light" color="primary" className="p-2 text-xl">
          {currentLang.flag}
        </Button>
      </DropdownTrigger>
      <DropdownMenu disallowEmptySelection selectionMode="single" selectedKeys={[locale]}>
        {languages.map(({ code, name, flag }) => (
          <DropdownItem
            color="primary"
            value={code}
            key={code}
            textValue={name}
            onPress={() => handleLanguageChange(code)}
          >
            <div className="flex items-center gap-2 pr-2">
              <span className="text-xl">{flag}</span>
              <p>{name}</p>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default LanguageSwitchDropdown;
