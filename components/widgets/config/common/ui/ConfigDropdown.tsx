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
  autoUpdate,
  hide,
  FloatingPortal,
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
  placement?:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "left-start"
    | "bottom-end"
    | "top-end";
  offsetDistance?: number;
  className?: string;
  // Acceso al setter del estado para controlar externamente
  setIsOpenRef?: React.MutableRefObject<((isOpen: boolean) => void) | null>;
  onOpenChange?: (isOpen: boolean) => void;
  // Usar portal para dropdowns anidados que necesiten escapar del stacking context padre
  usePortal?: boolean;
}

export const ConfigDropdown: React.FC<ConfigDropdownProps> = ({
  triggerElement,
  children,
  placement = "left-start",
  offsetDistance = 10,
  className = "",
  setIsOpenRef,
  onOpenChange,
  usePortal = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const { refs, floatingStyles, context } = useFloating({
    placement,
    open: isOpen,
    onOpenChange: handleOpenChange,
    middleware: [offset(offsetDistance), flip(), shift({ padding: 8 }), hide()],
    whileElementsMounted: autoUpdate,
    strategy: "fixed",
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
        <>
          {usePortal ? (
            <FloatingPortal>
              <div
                ref={refs.setFloating}
                style={{
                  ...floatingStyles,
                  zIndex: 1000,
                }}
                className={`config-dropdown ${className}`}
                {...getFloatingProps()}
              >
                {children}
              </div>
            </FloatingPortal>
          ) : (
            <div
              ref={refs.setFloating}
              style={{
                ...floatingStyles,
                zIndex: 1000,
              }}
              className={`config-dropdown ${className}`}
              {...getFloatingProps()}
            >
              {children}
            </div>
          )}
        </>
      )}
    </>
  );
};
