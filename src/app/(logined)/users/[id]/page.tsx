"use client";

import { toast } from "sonner";
import DifficultySelect from "@/components/difficulty";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc";
import { Difficulty } from "@prisma/client";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";

export default function Page({ params: { id } }: { params: { id: string } }) {
  const router = useRouter();

  const { data, refetch, isLoading } = trpc.user.getUser.useQuery({ id });

  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.KOLAY);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (data?.difficulty) {
      setDifficulty(data?.difficulty);
    }
  }, [data]);

  const { mutate } = trpc.user.updateUser.useMutation({
    onSuccess(data, variables, context) {
      toast.success("Güncellendi");
      refetch();
    },
    onError(error, variables, context) {
      toast.error(error.message);
    },
  });

  const { mutate: deleteMutate, isPending: deletePending } =
    trpc.user.deleteUser.useMutation({
      onSuccess(data, variables, context) {
        toast.success("Silindi");
        setOpen(false);
        router.push("/users");
      },
      onError(error, variables, context) {
        toast.error(error.message);
      },
    });

  function handleUpdate() {
    mutate({
      id,
      difficulty,
    });
  }

  function handleDelete() {
    deleteMutate({ id });
  }

  if (isLoading)
    return <LoaderCircle className="animate-spin mx-auto" size="2rem" />;

  return (
    <div className="flex flex-col p-5 gap-5">
      <div className="flex justify-between">
        {/* <Button variant="destructive" className="px-5">
          Sil
        </Button> */}

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="px-5"
              disabled={!!data?.admin}
            >
              Sil
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <Button
                className="bg-red-700 gap-5"
                disabled={deletePending}
                onClick={handleDelete}
              >
                {deletePending && <LoaderCircle className="animate-spin" />} Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          className="bg-green-700 px-5"
          disabled={difficulty === data?.difficulty}
          onClick={handleUpdate}
        >
          Güncelle
        </Button>
      </div>

      <div className="grid grid-cols-4 justify-items-center items-center gap-5">
        <div>Kullanıcı adı</div>
        <div>Çözülen</div>
        <div>Doğru Sayısı</div>
        <div>Zorluk</div>
        <hr className="col-span-4 w-full"></hr>
        <div>{data?.username}</div>
        <div>{data?.score}</div>
        <div>{data?.solved}</div>
        <div>
          <DifficultySelect
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        </div>
      </div>
    </div>
  );
}
