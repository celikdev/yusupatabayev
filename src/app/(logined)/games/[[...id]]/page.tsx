"use client";

import DifficultySelect from "@/components/difficulty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc";
import { Difficulty } from "@prisma/client";
import Chessground from "@react-chess/chessground";
import { Chess, Move } from "chess.js";
import { Info, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const placeholder = `Bu oyun hakkında açıklama ayarlayabilirsiniz. İlk satır başlık olarak gösterilecektir. Örnek:

Bobby Fischer vs Boris Spassky 1972 WC

Bu oyun satranç tarihinin en etkileyici ve analiz edilmiş oyunlarından biridir. Fischer bu oyunda Spassky'yi yenerek etkileyici bir strateji ve teknik beceri sergiledi. Özellikle Fischer'in orta oyundaki yaratıcı hareketleri ve oyunun sonundaki üstün oyun sonu stratejisi bu oyunu unutulmaz kılıyor.`;

const colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink"];

export default function Page({
  params: { id },
}: {
  params: { id?: string[] };
}) {
  const [chess] = useState(new Chess());
  const [description, setDescription] = useState("");
  const [pgnValue, setPgnValue] = useState("");
  const [pgn, setPgn] = useState("");
  const [fen, setFen] = useState("");
  const [chessHistory, setChessHistory] = useState<Move[]>([]);
  const [history, setHistory] = useState<[Move, Move?][]>([]);
  const [currentMove, setCurrentMove] = useState<number>();
  const [selections, setSelections] = useState<number[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.KOLAY);

  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState<number[]>([]);
  const router = useRouter();

  const [updating, forceUpdate] = useState(false);

  const {
    data,
    refetch: fetchGame,
    isLoading,
    error,
  } = trpc.game.getGame.useQuery({ id: id?.[0] || "" }, { enabled: false });

  const { mutate: add } = trpc.game.createGame.useMutation({
    onSuccess(data, variables, context) {
      toast.success("Oyun Eklendi!");
      router.push("/games/" + data.id);
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const { mutate: update } = trpc.game.updateGame.useMutation({
    onSuccess(data, variables, context) {
      router.push("/games/" + data.id);
      toast.success("Oyun Güncellendi!");
      fetchGame();
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const { mutate: remove } = trpc.game.deleteGames.useMutation({
    onSuccess(data, variables, context) {
      router.push("/games/list");
      toast.success("Oyun Silindi!");
      fetchGame();
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!data) return;

    if (data.description) setDescription(data.description);
    chess.loadPgn(data.pgn);
    setPgnValue(data.pgn);
    setPgn(data.pgn);
    //@ts-ignore
    setSelections(data.questions || []);
    setDifficulty(data.difficulty);
  }, [data]);

  useEffect(() => {
    if (!error) return;

    toast.error(error.message);
    router.push("/games/list");
  }, [error]);

  useEffect(() => {
    if (!id || !id.length) return;

    fetchGame();
  }, [id]);

  useEffect(() => {
    if (!pgn) return;

    const _chessHistory = chess.history({ verbose: true });
    setChessHistory(_chessHistory);

    const newHistory: [Move, Move?][] = [];
    for (let i = 0; i < _chessHistory.length; i += 2) {
      newHistory.push(_chessHistory.slice(i, i + 2) as [Move, Move?]);
    }
    setHistory(newHistory);
    setCurrentMove(newHistory.flat().length - 1);
  }, [pgn]);

  useEffect(() => {
    if (currentMove === undefined) return;

    chess.reset();
    for (let i = 0; i <= currentMove; i++) {
      const move = chessHistory[i];
      chess.move(move);
    }
    setFen(chess.fen());
  }, [currentMove]);

  useEffect(() => {
    if (selection.length !== 2) return;

    setSelections([
      ...selections,
      Array.from(
        { length: selection[1] - selection[0] + 1 },
        (_, i) => selection[0] + i
      ),
    ]);
    setSelecting(false);
    setSelection([]);
  }, [selection]);

  useEffect(() => {
    forceUpdate(false);
  }, [updating]);

  function handleLoad(e: any) {
    try {
      console.log("handleLoad");
      chess.loadPgn(pgnValue);
      setPgn(pgnValue);
    } catch (error) {
      e.preventDefault();
      toast.error("Geçersiz PGN!");
    }
  }

  function handleReset() {
    chess.reset();
    setPgn("");
    setPgnValue("");
    setHistory([]);
    setChessHistory([]);
    setCurrentMove(undefined);
    setSelections([]);
    setFen("");
    setDifficulty(Difficulty.KOLAY);
    forceUpdate(true);
  }

  function handleSave() {
    if (!id || id.length === 0)
      add({ description, pgn, questions: selections, difficulty });
    else
      update({
        id: id![0],
        pgn,
        description,
        questions: selections,
        difficulty,
      });
  }

  function handleAddQuestion() {
    setSelecting(!selecting);
    setSelection([]);
  }

  function handleMove(index: number) {
    setCurrentMove(index);

    if (!selecting) return;

    if (selection[0] >= index)
      toast.error("Başlangıç hamlesinden önceki hamle seçilemez!");
    else setSelection([...selection, index]);
  }

  function handleDeleteQuestion(index: number) {
    setSelections([
      ...selections.slice(0, index),
      ...selections.slice(index + 1),
    ]);
  }

  function handleDelete() {
    return remove(id!);
  }

  function getBg(index: number) {
    const colorIndex = index % colors.length;
    const color = colors[colorIndex];
    const opacity = 1;
    const value = `bg-${color}-${opacity}00`;
    return value;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex">
        {selecting && (
          <span>
            <span
              className={cn(
                "font-bold",
                selection[0] !== undefined ? "text-red-500" : "text-green-500"
              )}
            >
              {selection[0] !== undefined ? "Bitiş" : "Başlangıç"}
            </span>{" "}
            Hamlesini Seçin
          </span>
        )}
      </div>

      <div className="flex gap-5 justify-center">
        <div className="min-w-[600px] min-h-[600px]">
          {!updating && (
            <Chessground
              width={600}
              height={600}
              config={{ fen, movable: { free: false } }}
            />
          )}
        </div>

        <div className="flex flex-col">
          {isLoading && (
            <LoaderCircle className="animate-spin mx-auto mb-2" size="2rem " />
          )}
          <div className="flex gap-1 h-[40px] mb-1 min-w-[350px]">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="h-full w-full bg-blue-700 hover:bg-blue-800">
                  PGN Yükle
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>PGN Yükle</AlertDialogTitle>
                  <AlertDialogDescription>
                    <Textarea
                      value={pgnValue}
                      className="min-h-[300px] resize-none"
                      onChange={(e) => setPgnValue(e.target.value)}
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-blue-700 hover:bg-blue-800"
                    onClick={handleLoad}
                  >
                    Yükle
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="h-full w-full" disabled={!pgn}>
                  Sıfırla
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Oyunu Sıfırla?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Sıfırla
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="h-full w-full bg-red-500 hover:bg-red-600"
                  disabled={!pgn || !id}
                >
                  Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Silmek İstiyor Musun?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleDelete}
                  >
                    Evet
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              className="w-full h-full bg-green-700 hover:bg-green-800"
              onClick={handleSave}
              disabled={!pgn}
            >
              Kaydet
            </Button>
          </div>

          {pgn && (
            <div className="flex items-center max-h-[100px] gap-1 my-1">
              <Label>Açıklama</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger className="w-fit cursor-default" asChild>
                    <Info size={"1rem"} />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[400px] whitespace-break-spaces">
                    {placeholder}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {pgn && (
            <Textarea
              value={description}
              className="mb-1"
              onChange={(e) => setDescription(e.target.value)}
            />
          )}

          {pgn && <Separator />}

          <div className="max-h-[440px] overflow-y-auto">
            {history.map(([move1, move2], i) => {
              const questionIndex1 = selections.findIndex((x) =>
                x.includes(i + i)
              );
              const questionIndex2 = selections.findIndex((x) =>
                x.includes(i + i + 1)
              );

              return (
                <div className="flex even:bg-slate-50 odd:bg-slate-100" key={i}>
                  <div
                    className={cn(
                      "min-w-[150px] w-full font-semibold cursor-pointer text-zinc-500 hover:text-green-500",
                      selection.includes(i + i) && "text-sky-500",
                      currentMove === i + i && "text-red-500",
                      questionIndex1 !== -1 && getBg(questionIndex1)
                    )}
                    onClick={() => handleMove(i + i)}
                  >
                    <span>{`[${i + i + 1}]`}</span> {move1.san}
                  </div>
                  <div
                    className={cn(
                      "min-w-[150px] w-full font-semibold cursor-pointer text-black hover:text-green-500",
                      currentMove === i + i + 1 && "text-red-500",
                      questionIndex2 !== -1 && getBg(questionIndex2)
                    )}
                    onClick={() => move2 && handleMove(i + i + 1)}
                  >
                    <span>{move2 && `[${i + i + 2}]`}</span> {move2?.san}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Label className="font-bold text-md mb-1">Zorluk</Label>
          <DifficultySelect
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
          <br />
          <Label className="font-bold text-md mb-1">Sorular</Label>
          <div className="flex flex-col max-h-[560px] overflow-auto">
            {selections.map((selection, i) => (
              <div
                className="flex justify-center items-center gap-5 group cursor-default hover:bg-rose-50"
                key={i}
              >
                <span className="w-[100px] text-center">{`${
                  selection[0] + 1
                } - ${selection[selection.length - 1] + 1}`}</span>
                <Trash2
                  size={20}
                  onClick={() => handleDeleteQuestion(i)}
                  className="cursor-pointer text-red-500 opacity-10 group-hover:opacity-100"
                />
              </div>
            ))}
            <Button
              onClick={handleAddQuestion}
              className="mt-1"
              disabled={!pgn}
            >
              {selecting ? "İptal" : "Ekle"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
