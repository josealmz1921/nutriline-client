// components/Portal.tsx
import { createPortal } from "react-dom";

type PortalProps = {
  children: React.ReactNode;
  container?: Element;
};

function Portal({ children, container }: PortalProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(children, container ?? document.body);
}

export default Portal;
