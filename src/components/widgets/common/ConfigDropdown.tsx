import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  useInteractions,
  useClick,
  useRole,
  useDismiss,
} from "@floating-ui/react";

interface ConfigDropdownProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  triggerElement: (props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: React.Ref<any>;
    onClick: () => void;
    referenceProps: Record<string, unknown>;
  }) => ReactNode;
  children: ReactNode;
  placement?: "top" | "right" | "bottom" | "left" | "left-start";
  offsetDistance?: number;
  className?: string;
  // Acceso al setter del estado para controlar externamente
  setIsOpenRef?: React.MutableRefObject<((isOpen: boolean) => void) | null>;
}

export const ConfigDropdown: React.FC<ConfigDropdownProps> = ({
  triggerElement,
  children,
  placement = "left-start",
  offsetDistance = 10,
  className = "",
  setIsOpenRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(offsetDistance), flip(), shift()],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePress: true });
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const handleClick = () => {
    // Este manejador se llama cuando el trigger es clickeado
    // No necesitamos manejar isOpen manualmente ya que useInteractions se encarga de ello
    console.log("Dropdown trigger clicked");
  };

  // Exponer la función setIsOpen al componente padre
  useEffect(() => {
    if (setIsOpenRef) {
      setIsOpenRef.current = setIsOpen;
    }
  }, [setIsOpenRef]);

  return (
    <>
      {triggerElement({
        ref: refs.setReference,
        onClick: handleClick,
        referenceProps: getReferenceProps(),
      })}

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className={`config-dropdown ${className}`}
          {...getFloatingProps()}
        >
          {children}
        </div>
      )}
    </>
  );
};
