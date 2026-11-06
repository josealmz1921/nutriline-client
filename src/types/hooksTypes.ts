export type UseClickOutsideProps = {
  ref: React.RefObject<HTMLElement | null>;
  callback: (event: MouseEvent | TouchEvent) => void;
  enabled?: boolean;
};
