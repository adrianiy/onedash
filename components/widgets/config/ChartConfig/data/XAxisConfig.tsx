import { Icon } from "@/common/Icon";
import { ConfigDropdown } from "@/components/widgets/config/common/ui/ConfigDropdown";
import { EmptyPlaceholder } from "@/components/widgets/config/common/ui/EmptyPlaceholder";
import { useGridStore } from "@/store/gridStore";
import { breakdownCategories } from "@/types/breakdownLevels";
import type { ChartWidgetConfig, Widget } from "@/types/widget";
import React, { useRef, useState } from "react";
import { XAxisItem } from "./XAxisItem";

interface XAxisConfigProps {
  widget: Widget;
}

export const XAxisConfig: React.FC<XAxisConfigProps> = ({ widget }) => {
  const chartConfig =
    widget.type === "chart" ? widget.config : { xAxisDimension: undefined };
  const xAxisDimension = (chartConfig as ChartWidgetConfig).xAxisDimension;

  const [searchText, setSearchText] = useState("");
  const setDropdownOpenRef = useRef<((isOpen: boolean) => void) | null>(null);

  const findOptionById = (optionId: string) => {
    for (const category of breakdownCategories) {
      const option = category.options.find((opt) => opt.id === optionId);
      if (option) return option;
    }
    return null;
  };

  const findCategoryByOptionId = (optionId: string) => {
    for (const category of breakdownCategories) {
      if (category.options.some((opt) => opt.id === optionId)) {
        return category;
      }
    }
    return null;
  };

  const handleRemoveDimension = () => {
    if (widget.type === "chart") {
      useGridStore.getState().updateWidget(widget._id, {
        config: {
          ...widget.config,
          xAxisDimension: undefined,
        },
      });
    }
  };

  const filteredCategories = breakdownCategories
    .map((category) => ({
      ...category,
      options: category.options.filter((option) => {
        const matchesSearch =
          !searchText ||
          option.name.toLowerCase().includes(searchText.toLowerCase());
        const notSelected = xAxisDimension !== option.id;
        return matchesSearch && notSelected;
      }),
    }))
    .filter((category) => category.options.length > 0);

  const handleSelectOption = (option: { id: string }) => {
    if (widget.type === "chart") {
      useGridStore.getState().updateWidget(widget._id, {
        config: {
          ...widget.config,
          xAxisDimension: option.id as
            | "time"
            | "product"
            | "section"
            | "category",
        },
      });

      if (setDropdownOpenRef.current) {
        setDropdownOpenRef.current(false);
      }
    }
  };

  const renderXAxisItem = () => {
    if (!xAxisDimension) return null;

    const option = findOptionById(xAxisDimension);
    const category = findCategoryByOptionId(xAxisDimension);

    if (!option || !category) return null;

    return (
      <div className="xaxis-list config-panel__items-list">
        <XAxisItem
          option={option}
          category={category}
          onRemove={handleRemoveDimension}
        />
      </div>
    );
  };

  return (
    <div className="xaxis-config config-panel">
      <ConfigDropdown
        className="breakdown-dropdown"
        setIsOpenRef={setDropdownOpenRef}
        triggerElement={({ ref, onClick, referenceProps }) =>
          xAxisDimension ? (
            <>
              <div className="xaxis-config__header config-panel__header">
                <span className="xaxis-config__title config-panel__title">
                  EJE X (CATEGORÍA)
                </span>
                <button
                  ref={ref}
                  className="xaxis-config__add-button config-panel__add-button"
                  onClick={onClick}
                  {...referenceProps}
                >
                  <Icon name="edit" size={12} /> Cambiar
                </button>
              </div>
              {renderXAxisItem()}
            </>
          ) : (
            <EmptyPlaceholder
              iconName="plus"
              text="Añadir dimensión Eje X"
              onClick={onClick}
              referenceProps={referenceProps}
              forwardedRef={ref}
              className="xaxis-config__placeholder config-panel__placeholder"
            />
          )
        }
      >
        <div className="breakdown-search-container">
          <div className="breakdown-search-input-wrapper">
            <Icon name="search" size={16} className="breakdown-search-icon" />
            <input
              type="text"
              className="breakdown-search-input"
              placeholder="Busca dimensión a añadir"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button
                className="breakdown-search-clear"
                onClick={() => setSearchText("")}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
        </div>

        {filteredCategories.map((category) => (
          <div key={category.id} className="breakdown-category">
            <div
              className={`breakdown-category__header breakdown-category__header--${category.color}`}
            >
              <Icon
                name={category.icon}
                size={16}
                className={`breakdown-icon--${category.color}`}
              />
              <div>
                <h3
                  className={`breakdown-category__title breakdown-category__title--${category.color}`}
                >
                  {category.name}
                </h3>
                <p
                  className={`breakdown-category__description breakdown-category__description--${category.color}`}
                >
                  {category.description}
                </p>
              </div>
            </div>

            <div className="breakdown-options">
              {category.options.map((option) => (
                <button
                  key={option.id}
                  className="breakdown-option"
                  onClick={() => handleSelectOption(option)}
                >
                  <div
                    className={`breakdown-icon-container breakdown-icon-container--${category.color}`}
                  >
                    <Icon
                      name={category.icon}
                      size={14}
                      className={`breakdown-icon--${category.color}`}
                    />
                  </div>
                  <div className="breakdown-option__title">{option.name}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </ConfigDropdown>
    </div>
  );
};
