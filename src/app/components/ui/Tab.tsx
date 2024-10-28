import { OpenIcon } from "@/assets/icons";

const Tab = ({
  // selectedTab,
  setSelectedTab,
}: {
  selectedTab?: string;
  setSelectedTab?: (tab: string) => void;
}) => {
  return (
    <div className="flex w-full items-center gap-2 justify-center h-3/5 border-2 p-1 text-sm rounded-xl">
      <button
        // onClick={() => setSelectedTab("AnalysisBoard")}
        className="flex bg-white w-full h-full text-secondary items-center justify-center font-semibold rounded-lg"
      >
        Analiz Tahtası
      </button>
    </div>
  );
};

export default Tab;
