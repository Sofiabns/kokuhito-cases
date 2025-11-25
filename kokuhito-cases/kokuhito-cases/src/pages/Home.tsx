import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, FolderOpen, Users, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    resolvedCases: 0,
    totalPeople: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [casesResult, peopleResult] = await Promise.all([
        supabase.from("cases").select("*", { count: "exact" }),
        supabase.from("people").select("*", { count: "exact" }),
      ]);

      const cases = casesResult.data || [];
      const pendingCases = cases.filter((c) => !c.is_resolved).length;
      const resolvedCases = cases.filter((c) => c.is_resolved).length;

      setStats({
        totalCases: cases.length,
        pendingCases,
        resolvedCases,
        totalPeople: peopleResult.count || 0,
      });
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: "Criar Novo Caso",
      description: "Registrar um novo caso rapidinho",
      icon: PlusCircle,
      link: "/criar-caso",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Ver Casos",
      description: "Acessar todos os casos registrados",
      icon: FolderOpen,
      link: "/casos",
      color: "bg-accent text-accent-foreground",
    },
    {
      title: "Gerenciar Pessoas",
      description: "Adicionar ou editar pessoas",
      icon: Users,
      link: "/pessoas",
      color: "bg-secondary text-secondary-foreground",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-poppins font-bold text-white">
          Bem-vindo(a) Kokuhito!
        </h1>
        <p className="text-lg text-muted-foreground font-nunito max-w-2xl mx-auto">
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 card-soft hover-lift rounded-3xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-nunito mb-1">Total de Casos</p>
              <p className="text-3xl font-poppins font-bold">{stats.totalCases}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 card-soft hover-lift rounded-3xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-nunito mb-1">Pendentes</p>
              <p className="text-3xl font-poppins font-bold text-orange-500">{stats.pendingCases}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 card-soft hover-lift rounded-3xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-nunito mb-1">Resolvidos</p>
              <p className="text-3xl font-poppins font-bold text-green-500">{stats.resolvedCases}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 card-soft hover-lift rounded-3xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-nunito mb-1">Pessoas</p>
              <p className="text-3xl font-poppins font-bold">{stats.totalPeople}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-poppins font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.link} to={action.link}>
                <Card className="p-6 card-soft hover-lift rounded-3xl cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-poppins font-semibold text-lg mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-nunito">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
