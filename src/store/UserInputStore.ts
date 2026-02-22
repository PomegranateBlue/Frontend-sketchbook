import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UserInputState {
  initialAssets: number;
  monthlyInvests: number;
  investDuration: number;
  interestRate: number;

  setInitialAssets: (value: number) => void;
  setMonthlyInvests: (value: number) => void;
  setInvestDuration: (value: number) => void;
  setInterestRate: (value: number) => void;
}

export const useUserInputStore = create<UserInputState>()(
  devtools(
    (set) => ({
      initialAssets: 0,
      monthlyInvests: 0,
      investDuration: 0,
      interestRate: 0,
      setInitialAssets: (value) => set({ initialAssets: value }),
      setMonthlyInvests: (value) => set({ monthlyInvests: value }),
      setInvestDuration: (value) => set({ investDuration: value }),
      setInterestRate: (value) => set({ interestRate: value }),
    }),
    { name: "userInputDev" },
  ),
);
