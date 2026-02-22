import { useShallow } from "zustand/react/shallow";
import { useUserInputStore } from "../store/UserInputStore";
/**
 * 사용자 입력 폼 컴포넌트
 * - 보유 자산, 월 투자금, 투자 기간, 연이율을 입력받는다
 *
 *
 */
const UserInput = () => {
  const {
    initialAssets,
    setInitialAssets,
    monthlyInvests,
    setMonthlyInvests,
    investDuration,
    setInvestDuration,
    interestRate,
    setInterestRate,
  } = useUserInputStore(
    useShallow((state) => ({
      initialAssets: state.initialAssets,
      setInitialAssets: state.setInitialAssets,
      monthlyInvests: state.monthlyInvests,
      setMonthlyInvests: state.setMonthlyInvests,
      investDuration: state.investDuration,
      setInvestDuration: state.setInvestDuration,
      interestRate: state.interestRate,
      setInterestRate: state.setInterestRate,
    })),
  );

  const fields = [
    {
      label: "보유 자산",
      value: initialAssets,
      setter: setInitialAssets,
      max: 999_999_999_999,
    },
    {
      label: "매월 투자금",
      value: monthlyInvests,
      setter: setMonthlyInvests,
      max: 999_999_999,
    },
    {
      label: "투자기간(년)",
      value: investDuration,
      setter: setInvestDuration,
      max: 100,
    },
    {
      label: "연이율(%)",
      value: interestRate,
      setter: setInterestRate,
      max: 100,
    },
  ];

  return (
    <form className="flex flex-col justify-center items-center gap-4">
      {fields.map((field) => (
        <div key={field.label}>
          <label>{field.label}</label>
          <input
            className="border-2 border-slate-300 rounded-md p-2 w-1/2"
            type="text"
            required
            value={field.value ? field.value.toLocaleString("ko-KR") : ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/,/g, "");
              if (raw === "") {
                field.setter(0);
                return;
              }
              const num = Number(raw);
              if (!isNaN(num) && num <= field.max) {
                field.setter(num);
              }
            }}
          />
        </div>
      ))}
    </form>
  );
};

export default UserInput;
