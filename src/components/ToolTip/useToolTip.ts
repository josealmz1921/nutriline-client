import { useWindowSize } from '@/src/hooks/useWindowSize';

export function useToolTip() {
  const { width } = useWindowSize();
  return { isMobile: width <= 640 };
}
