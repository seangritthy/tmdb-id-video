"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { BiDownload, BiLogoAndroid, BiTv } from "react-icons/bi";
import { useDictionary } from "@/components/providers/DictionaryProvider";

const DownloadAppDropdown = () => {
  const dictionary = useDictionary();

  return (
    <Dropdown showArrow>
      <DropdownTrigger>
        <Button isIconOnly variant="light" color="primary" className="p-2 text-xl" title={dictionary.downloadApps || "Download Apps"}>
          <BiDownload />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Download App APKs">
        <DropdownItem
          key="mobile"
          textValue="Mobile App"
          startContent={<BiLogoAndroid className="text-xl text-success" />}
          description={dictionary.downloadMobileDesc || "For Android Phones & Tablets"}
          href="https://github.com/seangritthy/vdomov-apks/releases/latest/download/vdomov-mobile.apk"
          target="_blank"
          rel="noopener noreferrer"
        >
          {dictionary.downloadMobile || "VDOmov Mobile App"}
        </DropdownItem>
        <DropdownItem
          key="tv"
          textValue="TV App"
          startContent={<BiTv className="text-xl text-primary" />}
          description={dictionary.downloadTvDesc || "For Android TV & Smart TV Boxes"}
          href="https://github.com/seangritthy/vdomov-apks/releases/latest/download/vdomov-tv.apk"
          target="_blank"
          rel="noopener noreferrer"
        >
          {dictionary.downloadTv || "VDOtv TV App"}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default DownloadAppDropdown;
