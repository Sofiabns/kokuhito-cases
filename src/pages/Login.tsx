import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Senha padrão (pode ser alterada no código)
  const CORRECT_PASSWORD = "kokuhitorh123";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        localStorage.setItem("kokuhito-auth", "true");
        toast({
          title: "Bem-vindo! 💙",
          description: "Login realizado com sucesso",
        });
        navigate("/");
      } else {
        toast({
          title: "Hmm... senha errada 😅",
          description: "Tenta de novo!",
          variant: "destructive",
        });
        setPassword("");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-4">
            <span className="text-4xl">🌸</span>
          </div>
          <h1 className="text-4xl font-poppins font-bold text-foreground">
            Painel Kokuhito
          </h1>
          <p className="text-muted-foreground font-nunito">
            
          </p>
        </div>

        <form onSubmit={handleLogin} className="card-soft bg-card rounded-3xl p-8 space-y-6">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl border-2"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-2xl font-poppins font-semibold bg-gradient-primary hover:opacity-90 transition-all"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar "}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          
        </p>
      </div>
    </div>
  );
};

export default Login;
