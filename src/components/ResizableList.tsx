import {
  ListChildComponentProps,
  VariableSizeList,
  VariableSizeListProps,
} from "react-window";
import React, {
  ComponentProps,
  ComponentType,
  ElementType,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Signal } from "@preact/signals-react";
import { windowWidth } from "../utils/Window";
import { ScrollMemoryContext } from "./ScrollMemory";
import { useLocation } from "../routes/Router";

type ResizableListProps<Component extends ElementType> = Pick<
  VariableSizeListProps<ItemData<Component>>,
  "height" | "width" | "onItemsRendered" | "innerElementType" | "innerRef"
> & {
  itemData: ItemData<Component>;
};

type ItemData<Component extends ElementType> = Array<{
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
  rowData: {
    size: Signal<number>;
  };
}>;

export type SingleItemData<Component extends ElementType> = {
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
  rowData: {
    size: Signal<number>;
  };
};

export const ResizableList = <Component extends ElementType>(
  props: ResizableListProps<Component>,
) => {
  const {
    height,
    width,
    itemData,
    onItemsRendered,
    innerElementType,
    innerRef,
  } = props;
  const variableSizeListRef =
    useRef<VariableSizeList<WrappedItemData<Component>>>(null);

  const wrappedItemData = useWrappedItemData(itemData, variableSizeListRef);

  const { pathname: scrollID } = useLocation();
  const scrollMemory = useContext(ScrollMemoryContext);

  return (
    <VariableSizeList
      ref={variableSizeListRef}
      height={height}
      width={width}
      itemSize={(index) => itemData[index].rowData.size.value}
      itemCount={itemData.length}
      itemData={wrappedItemData}
      innerElementType={innerElementType}
      innerRef={innerRef}
      onItemsRendered={onItemsRendered}
      onScroll={(scrollProps) =>
        scrollMemory.set(scrollID, scrollProps.scrollOffset)
      }
      initialScrollOffset={scrollMemory.get(scrollID)}
      overscanCount={5}
    >
      {Row as RowType<Component>}
    </VariableSizeList>
  );
};

const useWrappedItemData = <Component extends ElementType>(
  itemData: ItemData<Component>,
  listRef: RefObject<VariableSizeList<WrappedItemData<Component>>>,
) =>
  useMemo(
    () =>
      itemData.map((row) => ({
        ...row,
        rowData: {
          ...row.rowData,
          listRef: listRef,
        },
      })),
    [itemData, listRef],
  );

type WrappedItemData<Component extends ElementType> = Array<{
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
  rowData: {
    size: Signal<number>;
    listRef: RefObject<VariableSizeList<WrappedItemData<Component>>>;
  };
}>;

type RowType<Component extends ElementType> = ComponentType<
  ListChildComponentProps<WrappedItemData<Component>>
>;

const Row = <Component extends ElementType>(
  props: ListChildComponentProps<WrappedItemData<Component>>,
) => {
  const { index, style, data } = props;
  const {
    RowComponent,
    rowData: { size, listRef },
    rowProps,
  } = data[index];

  const rowRef = useRef<HTMLDivElement>(null);
  const windowWidthValue = windowWidth.value;

  useEffect(() => {
    size.value = rowRef.current?.getBoundingClientRect().height ?? size.value;
    listRef.current?.resetAfterIndex(index);
  }, [index, listRef, size, windowWidthValue]);

  return (
    <div style={style}>
      <div ref={rowRef}>
        <RowComponent {...rowProps} />
      </div>
    </div>
  );
};
