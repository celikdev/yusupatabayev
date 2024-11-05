"use client";

import { toast } from "sonner";
import { trpc } from "@/trpc";
import { Chess, SQUARES, Square } from "chess.js";
import { useEffect, useReducer, useState } from "react";
import Chessground from "@react-chess/chessground";
const DynamicChessGround = dynamic(() => import("@react-chess/chessground"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

export default function Page() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState("");
  const [index, setIndex] = useState(0);

  const { refetch: updateMe } = trpc.auth.me.useQuery();

  const { data, isLoading, error, refetch } =
    trpc.question.getQuestion.useQuery();

  const { mutate } = trpc.question.submit.useMutation({
    onSuccess(data, variables, context) {
      updateMe();
      if (data.status) toast.success("Doğru Hamle!");
      else toast.error("Hatalı Hamle!");

      refetch();
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!data) return;
    const answerIndex = data.answers.length;
    setIndex(answerIndex);
    console.log("CHESS LOADED", Date.now());
    chess.load(data.befores[answerIndex]);
    setFen(data.befores[answerIndex]);
  }, [data]);

  const getOrientation = () => {
    const chess = new Chess();
    chess.load(data?.befores[0]);
    return chess.turn() === "w" ? "white" : "black";
  };

  const toDests = () => {
    const dests = new Map();
    SQUARES.forEach((s: Square) => {
      const ms = chess.moves({ square: s, verbose: true });
      if (ms.length) {
        dests.set(
          s,
          ms.map((m: any) => m.to)
        );
      }
    });
    return dests;
  };

  const responsiveWidth = window.innerWidth > 768 ? 680 : 320;
  const responsiveHeight = window.innerWidth > 768 ? 680 : 320;

  return (
    <div className="flex flex-col items-center gap-1">
      {!error && data && (
        <>
          <span>{data.description}</span>
          <span>
            Doğru{" "}
            <span className="font-bold text-purple-600">
              {Math.ceil((data.befores.length - index) / 2)}
            </span>{" "}
            hamle oynayın!
          </span>
        </>
      )}
      <div className="flex items-center justify-center">
        {isLoading && (
          <LoaderCircle className="animate-spin mx-auto" size="3rem" />
        )}
        {error && (
          <span className="text-xl font-bold">
            Tüm soruları çözdünüz. Tebrikler!
          </span>
        )}
        {!isLoading && !error && data && (
          <div className="w-[100%] flex flex-col items-center justify-center gap-4">
            <DynamicChessGround
              width={responsiveWidth}
              height={responsiveHeight}
              config={{
                orientation: getOrientation(),
                turnColor: chess.turn() === "w" ? "white" : "black",
                movable: { free: false, dests: toDests() },
                fen,
                highlight: {
                  lastMove: false,
                },
                events: {
                  move(orig, dest, capturedPiece) {
                    chess.move({ from: orig, to: dest });
                    setFen(chess.fen());

                    mutate({
                      fen: chess.fen(),
                      id: data!.id,
                    });
                  },
                },
              }}
            />
            <Button onClick={() => forceUpdate()}>Yenile</Button>
          </div>
        )}
      </div>
    </div>
  );
}
