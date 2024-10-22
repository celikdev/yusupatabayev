"use client";

import { DataTable } from "@/components/data-table";
import { AnswerModel } from "@/prisma";
import { trpc } from "@/trpc";
import { ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useMemo } from "react";

export default function Page() {
  const { data } = trpc.question.getAnswers.useQuery();

  const columns: ColumnDef<AnswerModel>[] = useMemo(
    () => [
      {
        id: "Index",
        header: "#",
        cell(props) {
          return props.row.index + 1;
        },
      },
      {
        id: "Id",
        header: "Id",
        accessorKey: "id",
      },
      {
        id: "Progress",
        header: "İlerleme",
        cell(props) {
          return `${Math.ceil(
            props.row.original.answers.length / 2
          )} / ${Math.ceil(props.row.original.afters.length / 2)}`;
        },
        meta: {
          cellClass: "w-full",
        },
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={data || []}
      getCoreRowModel={getCoreRowModel()}
      getRowId={(x) => x.id}
    />
  );
}
