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
      description: "",
      icon: PlusCircle,
      link: "/criar-caso",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Ver Casos",
      description: "",
      icon: FolderOpen,
      link: "/casos",
      color: "bg-accent text-accent-foreground",
    },
    {
      title: "Gerenciar Pessoas",
      description: "",
      icon: Users,
      link: "/pessoas",
      color: "bg-secondary text-secondary-foreground",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="text-center space-y-6 py-2">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-poppins font-bold text-foreground">
            Bem vindo(a), Kokuhito
          </h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 card-soft hover-lift rounded-3xl border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-nunito mb-2">Total de Casos</p>
              <p className="text-3xl font-poppins font-bold">{stats.totalCases}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 card-soft hover-lift rounded-3xl border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-nunito mb-2">Pendentes</p>
              <p className="text-3xl font-poppins font-bold text-orange-500">{stats.pendingCases}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <FolderOpen className="w-7 h-7 text-orange-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 card-soft hover-lift rounded-3xl border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-nunito mb-2">Resolvidos</p>
              <p className="text-3xl font-poppins font-bold text-green-500">{stats.resolvedCases}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <FolderOpen className="w-7 h-7 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-6 card-soft hover-lift rounded-3xl border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-nunito mb-2">Pessoas</p>
              <p className="text-3xl font-poppins font-bold">{stats.totalPeople}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Users className="w-7 h-7 text-secondary-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-poppins font-semibold">Ações Rápidas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.link} to={action.link}>
                <Card className="p-6 card-soft hover-lift rounded-3xl cursor-pointer group border-0 shadow-sm h-full">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`w-14 h-14 rounded-3xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-semibold text-lg">
                        {action.title}
                      </h3>
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
