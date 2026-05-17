import {
  List,
  ListProps,
  RowComponentProps,
  useDynamicRowHeight,
  useListRef,
} from "react-window";
import { ComponentProps, ElementType, use, useRef } from "react";
import { ScrollMemoryContext } from "./ScrollMemory";
import { useLocation } from "../router/hooks";

type ResizableListProps<Component extends ElementType> = Pick<
  ListProps<RowData<Component>>,
  "onRowsRendered" | "children" | "style"
> & {
  rowData: RowData<Component>;
  defaultRowHeight: number;
};

type RowData<Component extends ElementType> = Array<SingleRowData<Component>>;

export type SingleRowData<Component extends ElementType> = {
  RowComponent: Component;
  rowProps: ComponentProps<Component>;
};

export const ResizableList = <Component extends ElementType>(
  props: ResizableListProps<Component>,
) => {
  const { children, defaultRowHeight, onRowsRendered, rowData, style } = props;
  const listRef = useListRef(null);

  const { pathname: scrollID } = useLocation();
  const scrollMemory = use(ScrollMemoryContext);
  const initialScroll = useRef(scrollMemory.get(scrollID) || 0).current;
  const initialScrollApplied = useRef(false);

  const rowHeight = useDynamicRowHeight({ defaultRowHeight });

  return (
    <List
      rowHeight={rowHeight}
      rowCount={rowData.length}
      rowComponent={Row}
      rowProps={{ data: rowData }}
      listRef={listRef}
      onRowsRendered={(visibleRows, allRows) => {
        if (!initialScrollApplied.current && listRef.current?.element) {
          initialScrollApplied.current = true;
          setTimeout(() => {
            listRef.current?.element?.scrollTo({ top: initialScroll });
          }, 500);
        }
        onRowsRendered?.(visibleRows, allRows);
      }}
      onScroll={(event) =>
        scrollMemory.set(scrollID, event.currentTarget.scrollTop)
      }
      overscanCount={5}
      style={{ minHeight: "100%", ...style }}
    >
      {children}
    </List>
  );
};

type RowProps<Component extends ElementType> = {
  data: RowData<Component>;
};

const Row = <Component extends ElementType>(
  props: RowComponentProps<RowProps<Component>>,
) => {
  const { index, style, data } = props;
  const { RowComponent, rowProps } = data[index];

  return (
    <div style={style}>
      <RowComponent {...rowProps} />
    </div>
  );
};
