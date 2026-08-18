import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SiguiendoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight mb-3">Siguiendo</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Aquí aparecerán las transmisiones en vivo y los productos de los vendedores que sigues.
      </p>
      <Link href="/en-vivo">
        <Button>Explorar en vivo</Button>
      </Link>
    </div>
  );
}
