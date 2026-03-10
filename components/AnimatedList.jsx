"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useEffectEvent,
} from "react";
import { motion, useInView } from "motion/react";

const AnimatedItem = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

const AnimatedList = ({
  items = [
    "Item 1",
    "Item 2",
    "Item 3",
    "Item 4",
    "Item 5",
    "Item 6",
    "Item 7",
    "Item 8",
    "Item 9",
    "Item 10",
    "Item 11",
    "Item 12",
    "Item 13",
    "Item 14",
    "Item 15",
  ],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleItemMouseEnter = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (item, index) => {
      setSelectedIndex(index);
      if (onItemSelect) {
        onItemSelect(item, index);
      }
    },
    [onItemSelect],
  );

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );
  }, []);

  // useEffectEvent: selectedIndex, items, onItemSelect를 항상 최신값으로 읽되
  // 의존성 배열에 포함하지 않아도 됨 → keyboardNav state 자체가 불필요해짐
  const handleKeyEvent = useEffectEvent((key, shiftKey) => {
    const scrollToIndex = (index) => {
      if (index < 0 || !listRef.current) return;
      const container = listRef.current;
      const selectedItem = container.querySelector(`[data-index="${index}"]`);
      if (selectedItem) {
        const extraMargin = 50;
        const containerScrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const itemTop = selectedItem.offsetTop;
        const itemBottom = itemTop + selectedItem.offsetHeight;
        if (itemTop < containerScrollTop + extraMargin) {
          container.scrollTo({
            top: itemTop - extraMargin,
            behavior: "smooth",
          });
        } else if (
          itemBottom >
          containerScrollTop + containerHeight - extraMargin
        ) {
          container.scrollTo({
            top: itemBottom - containerHeight + extraMargin,
            behavior: "smooth",
          });
        }
      }
    };

    if (key === "ArrowDown" || (key === "Tab" && !shiftKey)) {
      const next = Math.min(selectedIndex + 1, items.length - 1);
      setSelectedIndex(next);
      scrollToIndex(next);
    } else if (key === "ArrowUp" || (key === "Tab" && shiftKey)) {
      const next = Math.max(selectedIndex - 1, 0);
      setSelectedIndex(next);
      scrollToIndex(next);
    } else if (key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < items.length && onItemSelect) {
        onItemSelect(items[selectedIndex], selectedIndex);
      }
    }
  });

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (["ArrowDown", "ArrowUp", "Tab", "Enter"].includes(e.key)) {
        e.preventDefault();
        handleKeyEvent(e.key, e.shiftKey);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableArrowNavigation]); // ← items, selectedIndex, onItemSelect 제거

  return (
    <div className={`relative w-[640px] ${className}`}>
      <div
        ref={listRef}
        className={`max-h-[640px] overflow-y-auto p-4 ${
          displayScrollbar
            ? "[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-[4px]"
            : "scrollbar-hide"
        }`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? "thin" : "none",
          scrollbarColor: "#222 #060010",
        }}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            delay={0.1}
            index={index}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            <div
              className={`p-4 bg-[#111] rounded-lg ${selectedIndex === index ? "bg-[#222]" : ""} ${itemClassName}`}
            >
              <p className="text-white m-0">{item}</p>
            </div>
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-b from-[#060010] to-transparent pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: topGradientOpacity }}
          ></div>
          <div
            className="absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-t from-[#060010] to-transparent pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: bottomGradientOpacity }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;
