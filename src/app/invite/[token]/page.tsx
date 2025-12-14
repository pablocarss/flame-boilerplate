"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Building2, Flame } from "lucide-react";

interface InviteData {
  id: string;
  email: string;
  role: string;
  organization: {
    name: string;
    slug: string;
  };
  sender: {
    name: string;
  };
}

export default function AcceptInvitePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const token = params.token as string;

  useEffect(() => {
    if (!token) {
      setError("Token invalido");
      setIsLoading(false);
      return;
    }

    fetch(`/api/invites/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvite(data.invite);
        }
      })
      .catch(() => {
        setError("Erro ao verificar convite");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const handleAccept = async () => {
    setIsAccepting(true);

    try {
      const response = await fetch(`/api/invites/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // User needs to login/register
          router.push(`/auth/login?redirect=/invite/${token}`);
          return;
        }
        throw new Error(result.error || "Erro ao aceitar convite");
      }

      setSuccess(true);
      toast({
        title: "Convite aceito!",
        description: `Voce agora faz parte de ${invite?.organization.name}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao aceitar convite",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Flame className="h-6 w-6 text-orange-500" />
          <span className="text-xl font-bold">Flame</span>
        </Link>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Convite Invalido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/">Voltar para o inicio</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Flame className="h-6 w-6 text-orange-500" />
          <span className="text-xl font-bold">Flame</span>
        </Link>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Convite Aceito!</CardTitle>
            <CardDescription>
              Voce agora faz parte de {invite?.organization.name}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/dashboard">Ir para o Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Flame className="h-6 w-6 text-orange-500" />
        <span className="text-xl font-bold">Flame</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Convite para Organizacao</CardTitle>
          <CardDescription>
            {invite?.sender.name || "Alguem"} convidou voce para fazer parte de{" "}
            <strong>{invite?.organization.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Organizacao</p>
            <p className="font-medium">{invite?.organization.name}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Sua funcao</p>
            <p className="font-medium">
              {invite?.role === "ADMIN" ? "Administrador" : "Membro"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aceitar Convite
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Recusar</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
