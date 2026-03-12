"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import AnimatedList from "@/components/AnimatedList";
import type { PillNavItem } from "@/components/PillNav";

const PillNav = dynamic(() => import("@/components/PillNav"), {
  ssr: false,
  loading: () => <div style={{ height: "42px" }} />,
});
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const PillNavLogo = "./favicon.ico";
const PillNavItems: PillNavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
];

const App = () => {
  // 투두 변수명을 다시 한 번 지어보자, 애초에 영어로 짓다보니 s 사용때문에 곤란하다
  //일단 개별적인 할 일과 할 일을 모아놓은 목록으로 구분하자

  const [inputText, setInputText] = useState<string>("");
  //이건 개별적인 투두를 다르게 될 상태이다

  const [todos, setTodos] = useState<Todo[]>([]);
  //위에거는 개별적인 할 일을 모아놓은 것으로 복수의 데이터를 다룬다

  const todoTexts = useMemo(() => todos.map((todo) => todo.text), [todos]);

  const addTodo = () => {
    if (!inputText.trim()) return;
    const newTodo: Todo = {
      id: Date.now(),
      text: inputText,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setInputText("");
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <main className="flex flex-col items-center justify-center p-8">
      <PillNav className="" logo={PillNavLogo} items={PillNavItems} />
      <form
        className="flex m-2 "
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
      >
        <input
          className="flex border-amber-500 border-2 rounded-lg p-1 text-white"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          className="flex border-2 text-white p-2 rounded-lg"
          type="submit"
        >
          추가
        </button>
      </form>
      <div className=" grid grid-cols-2 gap-4 mt-6 w-full max-w-xl min-h-32">
        {todos.length === 0 ? (
          <p className="col-span-2 text-center text-gray-500">
            할 일이 없습니다.
          </p>
        ) : (
          <AnimatedList
            items={todoTexts}
            onItemSelect={(_item: string, todosIndex: number) =>
              deleteTodo(todos[todosIndex].id)
            }
            showGradients={false}
            displayScrollbar={true}
          />
        )}
      </div>
    </main>
  );
};

export default App;
