import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

/**
 * A component to render content in a portal at the end of the document body
 * This helps with z-index issues and ensures menus are always on top
 */
export const Portal: React.FC<PortalProps> = ({ children }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    // Create a div for the portal
    const div = document.createElement("div");
    div.className = "portal-container";
    document.body.appendChild(div);
    setPortalContainer(div);

    // Clean up
    return () => {
      document.body.removeChild(div);
    };
  }, []);

  // Only render when we have a container
  if (!portalContainer) return null;

  return createPortal(children, portalContainer);
};
