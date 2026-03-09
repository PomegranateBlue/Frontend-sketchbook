"use client";

import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TEST = ["할 일 1", "할 일 2", "할 일 3"];

const App = () => {
  // 투두 변수명을 다시 한 번 지어보자, 애초에 영어로 짓다보니 s 사용때문에 곤란하다
  //일단 개별적인 할 일과 할 일을 모아놓은 목록으로 구분하자

  const [inputText, setInputText] = useState<string>("");
  //이건 개별적인 투두를 다르게 될 상태이다
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "할 일 1", completed: false },
    { id: 2, text: "할 일 2", completed: false },
    { id: 3, text: "할 일 3", completed: false },
  ]);
  //위에거는 개별적인 할 일을 모아놓은 것으로 복수의 데이터를 다룬다

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

  return (
    <main>
      <h2>So I can shout out loud in my own Convenience</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit">추가</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text} {todo.completed ? "(완료)" : "(미완료)"}
          </li>
        ))}
      </ul>
    </main>
  );
};

export default App;
