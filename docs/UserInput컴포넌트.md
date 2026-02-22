# UserInput 컴포넌트 리팩토링 과정

## 1단계: useState로 로컬 상태 관리

처음에는 각 입력값을 `useState`로 개별 관리했다.

```tsx
const [initialAssets, setInitialAssets] = useState(0);
const [monthlyInvests, setMonthlyInvests] = useState(0);
const [investDuration, setInvestDuration] = useState(0);
const [interestRate, setInterestRate] = useState(0);
```

**문제점**: `ResultShow` 컴포넌트에서 이 값들을 사용할 수 없다. `useState`는 해당 컴포넌트 안에서만 유효하기 때문이다.

---

## 2단계: Zustand 스토어 도입

컴포넌트 간 상태 공유를 위해 Zustand 스토어를 생성했다.

```ts
// UserInputStore.ts
export const useUserInputStore = create<UserInputState>()((set) => ({
  initialAssets: 0,
  setInitialAssets: (value) => set({ initialAssets: value }),
  // ...
}));
```

**주요 학습 포인트**:
- `=> { ... }` vs `=> ({ ... })`: 객체를 반환하려면 소괄호로 감싸야 한다
- `set()`은 shallow merge를 하므로 변경할 필드만 넘기면 된다
- setter 타입에 매개변수를 명시해야 한다: `(value: number) => void`

---

## 3단계: 개별 셀렉터로 스토어 값 꺼내기

`UserInput.tsx`에서 스토어 값을 하나씩 꺼내 사용했다.

```tsx
const initialAssets = useUserInputStore((state) => state.initialAssets);
const setInitialAssets = useUserInputStore((state) => state.setInitialAssets);
// ... 총 8줄
```

**동작은 하지만** 호출이 8번으로 코드가 길어진다.

---

## 4단계: useShallow로 통합

`useShallow`를 사용해 하나의 호출로 모든 값을 꺼내도록 개선했다.

```tsx
const {
  initialAssets, setInitialAssets,
  monthlyInvests, setMonthlyInvests,
  // ...
} = useUserInputStore(
  useShallow((state) => ({
    initialAssets: state.initialAssets,
    setInitialAssets: state.setInitialAssets,
    // ...
  })),
);
```

**useShallow가 필요한 이유**:
- 셀렉터가 객체를 반환하면 매번 새 객체가 생성된다
- `useShallow` 없이는 `===` 비교에서 항상 다른 값으로 판단 -> 무한 리렌더링
- `useShallow`는 프로퍼티별로 `===` 비교해서 실제 값이 바뀔 때만 리렌더링

**개별 셀렉터 vs useShallow 성능 차이**: 사실상 없다. 둘 다 "값이 바뀔 때만 리렌더링"이라는 결과가 동일하며, 코드 가독성 취향 차이다.

---

## 5단계: devtools 미들웨어 추가

브라우저 Redux DevTools에서 상태 변화를 실시간으로 확인할 수 있도록 `devtools` 미들웨어를 추가했다.

```ts
export const useUserInputStore = create<UserInputState>()(
  devtools(
    (set) => ({ ... }),
    { name: "userInputDev" },
  ),
);
```

**주의**: `devtools`는 함수를 감싸는 함수이므로 `devtools((set) => ...)` 형태로 써야 한다. `devtools(set) => ...`와 헷갈리지 않도록 주의.

---

## 6단계: 입력값 포맷팅 (쉼표 자릿수 표기)

`type="number"` -> `type="text"`로 변경하고, `toLocaleString`으로 입력 중에도 쉼표를 표시하도록 했다.

```tsx
value={field.value ? field.value.toLocaleString("ko-KR") : ""}
onChange={(e) => {
  const raw = e.target.value.replace(/,/g, ""); // 쉼표 제거
  if (raw === "") { field.setter(0); return; }   // 빈 입력 처리
  const num = Number(raw);
  if (!isNaN(num) && num <= field.max) field.setter(num);
}}
```

**핵심 원칙**: 스토어에는 항상 `number`로 저장하고, 포맷팅은 표시용으로만 처리한다.

**주요 학습 포인트**:
- `type="number"`는 쉼표를 허용하지 않으므로 `type="text"`를 써야 한다
- 빈 문자열 처리를 안 하면 전체 선택 후 삭제가 불가능하다 (`parseFloat("")`은 `NaN`)
- 최대값 제한은 `onChange`에서 `num <= field.max` 조건으로 처리

---

## 7단계: fields 배열 + map으로 반복 제거

4개의 동일한 구조의 input을 배열과 `map`으로 통합했다.

### Before (개별 작성)
```tsx
<label>보유 자산</label>
<input type="text" value={...} onChange={...} />
<label>매월 투자금</label>
<input type="text" value={...} onChange={...} />
<label>투자기간</label>
<input type="text" value={...} onChange={...} />
<label>연이율</label>
<input type="text" value={...} onChange={...} />
```

### After (map 패턴)
```tsx
const fields = [
  { label: "보유 자산", value: initialAssets, setter: setInitialAssets, max: 999_999_999_999 },
  { label: "매월 투자금", value: monthlyInvests, setter: setMonthlyInvests, max: 999_999_999 },
  { label: "투자기간(년)", value: investDuration, setter: setInvestDuration, max: 100 },
  { label: "연이율(%)", value: interestRate, setter: setInterestRate, max: 100 },
];

{fields.map((field) => (
  <div key={field.label}>
    <label>{field.label}</label>
    <input ... />
  </div>
))}
```

**판단 기준**: input들이 전부 같은 구조인가?
- 같다 -> `map` 패턴
- 다르다 (드롭다운, 슬라이더 등 혼재) -> 개별 작성

**주의**: `fields` 배열은 `useUserInputStore` 호출보다 아래에 선언해야 한다. `const`는 선언 전에 접근할 수 없다 (TDZ - Temporal Dead Zone).

---

## 최종 코드 구조

```
UserInputStore.ts     - Zustand 스토어 (상태 + setter + devtools)
    |
UserInput.tsx         - 스토어에서 useShallow로 값 꺼내기
    |                   fields 배열 + map으로 input 렌더링
    |                   type="text" + toLocaleString 포맷팅
    |
ResultShow.tsx        - 같은 스토어에서 값 읽어서 계산 결과 표시
```
