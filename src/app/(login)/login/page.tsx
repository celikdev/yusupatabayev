"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export default function Page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { isPending, mutate, error } = trpc.auth.login.useMutation({
    onSuccess(data, variables, context) {
      if (data.token) localStorage.setItem("chess_jwt_token", data.token);
      if (data.admin) return router.push("/games/list");
      router.push("/game");
    },
  });

  function handleLogin() {
    mutate({ username, password });
  }

  return (
    <div className="flex w-screen h-screen items-center justify-center">
      <div className="flex flex-col w-[500px] gap-5 border rounded-md p-5">
        <span className="mx-auto text-xl font-bold">Login</span>
        {error && <span className="text-red-500 mx-auto">{error.message}</span>}
        {isPending && (
          <LoaderCircle className="animate-spin mx-auto" size="1.5rem" />
        )}
        <Input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button className="w-fit ml-auto" onClick={handleLogin}>
          Submit
        </Button>
      </div>
    </div>
  );
}
