"use client";

import React from "react";
import Header from "../components/header";
import Provider from "../components/provider";
import { Toaster } from "@/components/ui/sonner";

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <Header />
      <div className="p-2 border">{children}</div>
      <Toaster richColors closeButton />
    </Provider>
  );
}
