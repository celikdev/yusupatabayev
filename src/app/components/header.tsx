"use client";

import { trpc } from "@/trpc";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data, error } = trpc.auth.me.useQuery();
  const router = useRouter();

  useEffect(() => {
    if (!error) return;

    router.push("/login");
  }, [error]);

  function handleLogout() {
    localStorage.removeItem("chess_jwt_token");
    router.push("/login");
  }

  return (
    <div className="flex p-3 md:px-10 justify-between items-center bg-zinc-300">
      <Link href="/game">Oyun</Link>

      <div className="flex md:flex-row flex-col md:gap-10 items-center text-sm md:text-base">
        {data?.admin && (
          <>
            <Link href="/users">Kullanıcılar</Link>
            <Link href="/games/list">Oyunlar</Link>
          </>
        )}

        <Link href="/history">Geçmiş</Link>
        <span>Giriş Yapan: {data?.username}</span>
        <span>
          Puan: {data?.score} / {data?.solved}
        </span>
        <Button
          className="bg-transparent border border-transparent hover:bg-transparent hover:border-black text-black"
          onClick={handleLogout}
        >
          <LogOut size="1rem" />
        </Button>
      </div>
    </div>
  );
}
