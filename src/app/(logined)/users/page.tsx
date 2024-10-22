"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { userInput } from "@/input/user";
import { UserModel } from "@/prisma";
import { trpc } from "@/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import DifficultySelect from "@/components/difficulty";
import { Difficulty } from "@prisma/client";

const columns: ColumnDef<Omit<UserModel, "password" | "admin">>[] = [
  {
    id: "Index",
    header: "#",
    cell(props) {
      return props.row.index + 1;
    },
  },
  {
    id: "username",
    accessorKey: "username",
    header: "Kullanıcı Adı",
  },
  {
    id: "solved",
    accessorKey: "solved",
    header: "Çözülen",
  },
  {
    id: "score",
    accessorKey: "score",
    header: "Doğru Sayısı",
  },
  {
    id: "difficulty",
    accessorKey: "difficulty",
    header: "Zorluk",
  },
  {
    id: "details",
    cell: (props) => (
      <Link href={`/users/${props.row.original.id}`}>
        <Button>Detay</Button>
      </Link>
    ),
    header: "",
  },
];

export default function Page() {
  const [open, setOpen] = useState(false);

  const { data, refetch, isLoading } = trpc.user.getUsers.useQuery();
  const { mutate } = trpc.user.createUser.useMutation({
    onError(error) {
      toast.error(error.message);
    },
    onSuccess(_, variables) {
      toast.success(`'${variables.username}' kullanıcısı eklendi!`);
      form.reset();
      refetch();
    },
  });

  const form = useForm<z.infer<typeof userInput>>({
    resolver: zodResolver(userInput),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof userInput>) {
    mutate(values);
  }

  return (
    <div className="flex flex-col p-5">
      <Collapsible open={open} onOpenChange={setOpen} className="mb-5">
        <CollapsibleTrigger asChild>
          <Button className="bg-green-700">Yeni Kullanıcı Ekle</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="my-5 CollapsibleContent">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örnek Kullancı Adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input placeholder="Örnek Şifre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zorluk</FormLabel>
                    <FormControl>
                      <DifficultySelect
                        difficulty={field.value as Difficulty}
                        setDifficulty={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Ekle</Button>
            </form>
            <Separator className="my-5" />
          </Form>
        </CollapsibleContent>
      </Collapsible>

      {isLoading && (
        <LoaderCircle className="animate-spin mx-auto" size="2rem " />
      )}

      {data && (
        <DataTable
          //@ts-ignore
          columns={columns}
          data={data || []}
          getCoreRowModel={getCoreRowModel()}
          getRowId={(x) => x.id}
        />
      )}
    </div>
  );
}
