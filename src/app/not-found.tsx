import { initPolyfill } from '@/utils/xhr-polyfill';
initPolyfill();

export const runtime = 'edge';

import NotFoundClient from "@/components/ui/NotFoundClient";

export default function NotFound() {
  return <NotFoundClient />;
}
