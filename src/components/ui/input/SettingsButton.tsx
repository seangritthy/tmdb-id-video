"use client";

import { useEffect, useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { useDictionary } from "@/components/providers/DictionaryProvider";

const SettingsButton = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const dictionary = useDictionary();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      App.getInfo().then((info) => {
        setAppVersion(info.version);
      }).catch(console.error);
    }
  }, []);

  return (
    <>
      <Button isIconOnly variant="light" color="primary" className="p-2 text-xl" onPress={onOpen} title={dictionary.settings || "Settings"}>
        <Icon icon="mdi:cog" width={24} height={24} />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{dictionary.settings || "Settings"}</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">About App</h3>
                    <p className="text-sm text-default-500">
                      {appVersion ? `Android App Version ${appVersion}` : "Web Version"}
                    </p>
                    <p className="text-sm text-default-500 mt-2">
                      This app automatically syncs with the latest updates from the website. No manual updates required!
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SettingsButton;
