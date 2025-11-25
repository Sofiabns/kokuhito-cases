import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserCircle2, Edit, Trash2, Plus, Search, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Person {
  id: string;
  name: string;
  created_at: string;
  caseCount?: number;
}

interface Case {
  id: string;
  requester_id: string;
  related_person_id: string;
  vision_1: string | null;
  vision_2: string | null;
  resolution_comment: string | null;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
  requester?: Person;
  related_person?: Person;
}

const People = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personCases, setPersonCases] = useState<Case[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCasesModalOpen, setIsCasesModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [editForm, setEditForm] = useState({ name: "" });

  const fetchPeople = async () => {
    const { data: peopleData, error: peopleError } = await supabase
      .from("people")
      .select("*")
      .order("name");

    if (peopleError) {
      toast({
        title: "Erro ao carregar pessoas",
        description: peopleError.message,
        variant: "destructive",
      });
      return;
    }

    // Fetch case counts
    const { data: casesData } = await supabase.from("cases").select("*");

    const peopleWithCounts = peopleData?.map((person) => {
      const count =
        casesData?.filter(
          (c) => c.requester_id === person.id || c.related_person_id === person.id
        ).length || 0;
      return { ...person, caseCount: count };
    });

    setPeople(peopleWithCounts || []);
    setFilteredPeople(peopleWithCounts || []);
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    let filtered = people;

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "most-cases") {
      filtered = [...filtered].sort((a, b) => (b.caseCount || 0) - (a.caseCount || 0));
    } else if (sortBy === "least-cases") {
      filtered = [...filtered].sort((a, b) => (a.caseCount || 0) - (b.caseCount || 0));
    }

    setFilteredPeople(filtered);
  }, [searchTerm, sortBy, people]);

  const handleAdd = async () => {
    if (!editForm.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite um nome",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("people").insert([{ name: editForm.name }]);

    if (error) {
      toast({
        title: "Erro ao adicionar pessoa",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pessoa adicionada! 🎉",
        description: "Nova pessoa foi registrada",
      });
      setIsAdding(false);
      setEditForm({ name: "" });
      fetchPeople();
    }
  };

  const handleEdit = async () => {
    if (!selectedPerson || !editForm.name.trim()) return;

    const { error } = await supabase
      .from("people")
      .update({ name: editForm.name })
      .eq("id", selectedPerson.id);

    if (error) {
      toast({
        title: "Erro ao editar pessoa",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pessoa atualizada! 💙",
        description: "As alterações foram salvas",
      });
      setIsEditing(false);
      setSelectedPerson(null);
      fetchPeople();
    }
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;

    const { error } = await supabase
      .from("people")
      .delete()
      .eq("id", selectedPerson.id);

    if (error) {
      toast({
        title: "Erro ao excluir pessoa",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pessoa excluída 🗑️",
        description: "A pessoa foi removida com sucesso",
      });
      setIsDeleting(false);
      setSelectedPerson(null);
      fetchPeople();
    }
  };

  const openPersonCases = async (person: Person) => {
    setSelectedPerson(person);
    setEditForm({ name: person.name });
    
    // Fetch cases for this person
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .or(`requester_id.eq.${person.id},related_person_id.eq.${person.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar casos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Fetch person names for cases
    const peopleIds = new Set<string>();
    data?.forEach((c) => {
      peopleIds.add(c.requester_id);
      peopleIds.add(c.related_person_id);
    });

    const { data: peopleData } = await supabase
      .from("people")
      .select("*")
      .in("id", Array.from(peopleIds));

    const peopleMap = new Map(peopleData?.map((p) => [p.id, p]) || []);

    const casesWithNames = data?.map((c) => ({
      ...c,
      requester: peopleMap.get(c.requester_id),
      related_person: peopleMap.get(c.related_person_id),
    }));

    setPersonCases(casesWithNames || []);
    setIsCasesModalOpen(true);
  };

  const closePersonCases = () => {
    setIsCasesModalOpen(false);
    setSelectedPerson(null);
    setPersonCases([]);
    setEditForm({ name: "" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getCaseStatusIcon = (isResolved: boolean) => {
    return isResolved ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <Clock className="w-4 h-4 text-orange-500" />
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-poppins font-bold mb-2">Pessoas</h1>
        <p className="text-muted-foreground font-nunito">
          Gerencie todas as pessoas cadastradas no sistema
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 card-soft rounded-3xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 rounded-2xl"
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label className="font-nunito whitespace-nowrap">Ordenar por:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12 rounded-2xl">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                  <SelectItem value="most-cases">Mais casos</SelectItem>
                  <SelectItem value="least-cases">Menos casos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                setEditForm({ name: "" });
                setIsAdding(true);
              }}
              className="h-12 rounded-2xl bg-gradient-primary hover:opacity-90 font-poppins"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </Card>

      {/* People Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPeople.map((person) => (
          <Card
            key={person.id}
            className="p-6 card-soft hover-lift rounded-3xl cursor-pointer"
            onClick={() => openPersonCases(person)}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-poppins font-bold text-xl">
                {getInitials(person.name)}
              </div>
              <div className="w-full">
                <h3 className="font-poppins font-semibold text-lg mb-1 truncate">
                  {person.name}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {person.caseCount || 0} {person.caseCount === 1 ? "caso" : "casos"}
                  </Badge>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filteredPeople.length === 0 && (
          <div className="col-span-full text-center py-12">
            <UserCircle2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-nunito">
              Nenhuma pessoa encontrada
            </p>
          </div>
        )}
      </div>

      {/* Person Cases Modal */}
      <Dialog open={isCasesModalOpen} onOpenChange={setIsCasesModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden rounded-3xl">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-poppins font-bold text-lg">
                {selectedPerson ? getInitials(selectedPerson.name) : ""}
              </div>
              <div className="flex-1">
                <DialogTitle className="font-poppins text-xl">
                  {selectedPerson?.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground font-nunito">
                  {personCases.length} {personCases.length === 1 ? "caso relacionado" : "casos relacionados"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="h-9 rounded-xl font-poppins"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleting(true)}
                  className="h-9 rounded-xl font-poppins"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(80vh-200px)] space-y-3">
            {personCases.map((caseItem) => (
              <Card
                key={caseItem.id}
                className="p-4 card-soft rounded-2xl"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-poppins font-semibold text-base mb-1 truncate">
                        {caseItem.requester?.name || "Desconhecido"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sobre: {caseItem.related_person?.name || "Desconhecido"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getCaseStatusIcon(caseItem.is_resolved)}
                      <Badge
                        variant={caseItem.is_resolved ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {caseItem.is_resolved ? "Resolvido" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {caseItem.vision_1 && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        <span className="font-medium">Visão 1:</span> {caseItem.vision_1}
                      </p>
                    )}
                    {caseItem.vision_2 && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        <span className="font-medium">Visão 2:</span> {caseItem.vision_2}
                      </p>
                    )}
                    {caseItem.resolution_comment && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        <span className="font-medium">Resolução:</span> {caseItem.resolution_comment}
                      </p>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground font-nunito">
                    {format(new Date(caseItem.created_at), "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </Card>
            ))}
            
            {personCases.length === 0 && (
              <div className="text-center py-8">
                <UserCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-nunito">
                  Nenhum caso relacionado encontrado
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={isAdding || isEditing} onOpenChange={() => {
        setIsAdding(false);
        setIsEditing(false);
      }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-poppins text-2xl">
              {isAdding ? "Adicionar Pessoa" : "Editar Pessoa"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-poppins">Nome</Label>
              <Input
                placeholder="Digite o nome..."
                value={editForm.name}
                onChange={(e) => setEditForm({ name: e.target.value })}
                className="h-12 rounded-2xl"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={isAdding ? handleAdd : handleEdit}
              className="flex-1 h-11 rounded-2xl bg-gradient-primary hover:opacity-90 font-poppins"
            >
              {isAdding ? "Adicionar" : "Salvar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setIsEditing(false);
              }}
              className="h-11 rounded-2xl font-poppins"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-poppins">
              Tem certeza?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-nunito">
              {selectedPerson && selectedPerson.caseCount! > 0
                ? "Esta pessoa tem casos relacionados. Excluir a pessoa também excluirá os casos! 🗑️"
                : "Isso não pode ser desfeito! 🗑️"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-2xl bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default People;
