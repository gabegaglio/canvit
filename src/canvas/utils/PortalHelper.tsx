import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
}

export const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    if (container) {
      setPortalContainer(container);
    } else {
      // Create a default portal container if none is provided
      const defaultContainer = document.createElement("div");
      defaultContainer.id = "portal-container";
      document.body.appendChild(defaultContainer);
      setPortalContainer(defaultContainer);

      return () => {
        if (document.body.contains(defaultContainer)) {
          document.body.removeChild(defaultContainer);
        }
      };
    }
  }, [container]);

  if (!portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
};
