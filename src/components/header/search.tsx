"use client";
import React, { useEffect, useState, useRef, FocusEvent } from "react";
import { Card, Form, Input } from "antd";
import { IoSearch } from "react-icons/io5";

import SearchCard from "../../app/(screens)/product-search/searchCard";
import CONFIG from "@/config/configuration";
import { useRouter } from "next/navigation";

const placeholders = ["Gift . . .", "Glue . . .", "Stick . . .", "Pen . . ."];

function Search(props: any) {
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState<any>(null);
  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % placeholders.length;
      setPlaceholder(placeholders[index]);
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
  };

  const closeSuggestions = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <Form onFinish={(s) => router.push(`/search/${s?.search}`)}>
        <Form.Item name={"search"} className="mb-0">
          <Input
            size="large"
            placeholder={`Search ` + placeholder}
            onChange={(value) => setText(value?.target?.value)}
            onFocus={handleFocus}
            suffix={
              <IoSearch
                size={20}
                color={text?.length > 2 ? CONFIG.COLOR : "grey"}
                style={{ marginRight: 10 }}
              />
            }
            style={{ backgroundColor: "#f8f8f8", padding: 9 }}
          ></Input>
        </Form.Item>
      </Form>
      {text?.length > 2 && isFocused ? (
        <div ref={suggestionsRef} className="Header-search-suggestions">
          <SearchCard text={text} onSelect={closeSuggestions} />
        </div>
      ) : null}
    </div>
  );
}
export default Search;
