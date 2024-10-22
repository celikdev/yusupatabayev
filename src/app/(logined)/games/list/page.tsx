/* eslint-disable @next/next/no-img-element */
"use client";

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
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { GameModel } from "@/prisma";
import { trpc } from "@/trpc";
import {
  ColumnDef,
  getCoreRowModel,
  RowSelectionState,
} from "@tanstack/react-table";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const { data, refetch, isLoading } = trpc.game.getGames.useQuery();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { mutate: remove } = trpc.game.deleteGames.useMutation({
    onSuccess(data, variables, context) {
      toast.success("Oyun Silindi!");
      refetch();
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const getTitle = (description?: string | null) => {
    const title = description?.split(/\r?\n/)[0];
    return `${title?.slice(0, 50)}${title && title.length > 50 ? " ..." : ""}`;
  };

  const columns: ColumnDef<GameModel>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
      },
      {
        id: "Index",
        header: "#",
        cell(props) {
          return props.row.index + 1;
        },
      },
      {
        id: "description",
        accessorKey: "description",
        header: "Açıklama",
        cell(props) {
          return getTitle(props.row.original.description);
        },
        meta: {
          cellClass: "w-full",
        },
      },
      {
        id: "questions",
        header: "Soru Sayısı",
        accessorFn: (x) => (x.questions as number[][])?.length,
        meta: {
          cellClass: "text-center",
        },
      },
      {
        id: "difficulty",
        accessorKey: "difficulty",
        header: "Zorluk",
      },
      {
        id: "actions",
        header: "İşlem",
        cell(props) {
          return (
            <Link href={`/games/${props.row.id}`}>
              <Button className="bg-blue-600">Güncelle</Button>
            </Link>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Link href="/games">
          <Button className="w-fit">Oyun Ekle</Button>
        </Link>

        {Object.keys(rowSelection).length !== 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-rose-700">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  games.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-rose-700"
                  onClick={() => remove(Object.keys(rowSelection))}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {isLoading && (
        <LoaderCircle className="animate-spin mx-auto" size="2rem " />
      )}

      {data && (
        //@ts-ignore
        <DataTable
          onRowSelectionChange={setRowSelection}
          columns={columns}
          data={data || []}
          getCoreRowModel={getCoreRowModel()}
          getRowId={(x) => x.id}
          state={{
            rowSelection,
          }}
        />
      )}
    </div>
  );
}
