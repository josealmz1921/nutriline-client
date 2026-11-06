import { useWindowSize } from './useWindowSize';

export const useIsMobile = (width = 768) => {
  return useWindowSize().width <= width;
};
