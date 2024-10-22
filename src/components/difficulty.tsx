import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Difficulty } from "@prisma/client";

type Props = {
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
};

export default function DifficultySelect({ difficulty, setDifficulty }: Props) {
  return (
    <Select value={difficulty} onValueChange={setDifficulty}>
      <SelectTrigger>
        <SelectValue placeholder="Zorluk" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={Difficulty.KOLAY}>{Difficulty.KOLAY}</SelectItem>
        <SelectItem value={Difficulty.ORTA}>{Difficulty.ORTA}</SelectItem>
        <SelectItem value={Difficulty.ZOR}>{Difficulty.ZOR}</SelectItem>
      </SelectContent>
    </Select>
  );
}
