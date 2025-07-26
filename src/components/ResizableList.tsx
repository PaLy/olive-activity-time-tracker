import {
  ListChildComponentProps,
  VariableSizeList,
  VariableSizeListProps,
} from "react-window";
import {
  ComponentProps,
  ComponentType,
  ElementType,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { ScrollMemoryContext } from "./ScrollMemory";
import { useLocation } from "../router/hooks";
import { useDebounceCallback } from "usehooks-ts";

type ResizableListProps<Component extends ElementType> = Pick<
  VariableSizeListProps<ItemData<Component>>,
  "height" | "width" | "onItemsRendered" | "innerElementType" | "innerRef"
> & {
  itemData: ItemData<Component>;
  /**
   * If defined, virtualized list will not be rerendered immediately.
   * The function should trigger the virtualized list rerender.
   */
  onResetAfterIndex?: () => void;
};

type ItemData<Component extends ElementType> = Array<{
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
  rowData: {
    size: number;
  };
}>;

export type SingleItemData<Component extends ElementType> = {
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
  rowData: {
    size: number;
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
    onResetAfterIndex,
  } = props;
  const variableSizeListRef =
    useRef<VariableSizeList<WrappedItemData<Component>>>(null);

  const computedRowHeights = useRef(new Map<number, number>());

  const wrappedItemData = useWrappedItemData(
    itemData,
    variableSizeListRef,
    computedRowHeights,
    onResetAfterIndex,
  );

  const { pathname: scrollID } = useLocation();
  const scrollMemory = useContext(ScrollMemoryContext);

  return (
    <VariableSizeList
      ref={variableSizeListRef}
      height={height}
      width={width}
      itemSize={(index) =>
        computedRowHeights.current.get(index) ?? itemData[index].rowData.size
      }
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
  listRef: RefObject<VariableSizeList<WrappedItemData<Component>> | null>,
  computedRowHeights: RefObject<Map<number, number>>,
  onResetAfterIndex?: () => void,
) => {
  const resetListAfterIndex = useResetListAfterIndex(
    listRef,
    onResetAfterIndex,
  );

  return useMemo(
    () =>
      itemData.map((row) => ({
        ...row,
        rowData: {
          ...row.rowData,
          resetListAfterIndex,
          computedRowHeights,
        },
      })),
    [computedRowHeights, itemData, resetListAfterIndex],
  );
};

type WrappedItemData<Component extends ElementType> = Array<{
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
  rowData: {
    size: number;
    resetListAfterIndex: (index: number) => void;
    computedRowHeights: RefObject<Map<number, number>>;
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
    rowData: { size, resetListAfterIndex, computedRowHeights },
    rowProps,
  } = data[index];

  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const computedHeight = computedRowHeights.current.get(index);
    const rowHeight = computedHeight ?? size;
    const componentHeight = rowRef.current!.getBoundingClientRect().height;

    if (rowHeight !== componentHeight) {
      if (process.env.NODE_ENV === "development") {
        console.log(`Resetting list after index ${index}.`);
        console.log(`Height changed from ${rowHeight} to ${componentHeight}.`);
      }
      computedRowHeights.current.set(index, componentHeight);
      resetListAfterIndex(index);
    } else if (computedHeight === undefined) {
      computedRowHeights.current.set(index, componentHeight);
    }
  });

  return (
    <div style={style}>
      <div ref={rowRef}>
        <RowComponent {...rowProps} />
      </div>
    </div>
  );
};

const useResetListAfterIndex = <T,>(
  listRef: RefObject<VariableSizeList<T> | null>,
  onResetAfterIndex?: () => void,
) => {
  const indexRef = useRef(Number.MAX_SAFE_INTEGER);

  const reset = useDebounceCallback(() => {
    if (indexRef.current !== Number.MAX_SAFE_INTEGER) {
      const index = indexRef.current;
      indexRef.current = Number.MAX_SAFE_INTEGER;
      listRef.current?.resetAfterIndex(index, !onResetAfterIndex);
      onResetAfterIndex?.();
    }
  }, 10);

  return useCallback(
    (index: number) => {
      indexRef.current = Math.min(indexRef.current, index);
      reset();
    },
    [reset],
  );
};
